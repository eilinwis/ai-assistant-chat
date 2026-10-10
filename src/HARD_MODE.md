# Hard Mode

An opt-in mode that makes Chat Lab behave like a messy real-world product, for
practising realistic Playwright e2e testing. **Off by default** — existing
tests and lessons are unaffected.

## Enabling it

- **UI:** the "Hard mode" toggle in the top-left corner; ⚙ opens a panel to
  pick individual flags and set the seed.
- **URL:** `/?hard=all&seed=4`, a subset: `/?hard=popups,latency&seed=4`,
  or a [flag set](#flag-sets): `/?hard=bad-network&seed=4` (sets and flags
  mix: `?hard=bad-network,popups`). `?hard=off` turns it off.
- **Persistence:** saved in `localStorage` under `chat-lab:hard-mode`, so it
  survives client-side navigation (which drops the query string).

Precedence: `?hard=` in the URL, then the stored config, then off. A bare
`?seed=` never turns hard mode on.

## Seed and determinism

A seed is a number from **1 to 10** — ten scenarios per flag set. Typed into
the ⚙ panel it must be 1–10 exactly. From a URL or a saved config, an older
seed outside the range (they used to go up to 999 999 999) is folded into it
— 42 → 2, 0 → 10 — so old links keep working, if as another scenario. With
no seed anywhere, one is picked at random.

All randomness is derived from the seed: same seed + same actions = same
delays, failures and popup timing. The seed is shown as a "seed N" badge next
to the toggle and logged to the console, so a failing run can be replayed.

Every random value is a pure function of the seed and a key —
`rand(seed, 'latency', attempt)` (see `hardMode/rng.ts`). There is no shared
random stream, so the results don't depend on render count (StrictMode) or on
the order in which features ask for numbers.

A seed fixes *what* happens — which send fails, how long a reply takes, when
the promo shows — but not *when* that lands relative to a test's own actions:
`latency` really waits, the promo counts from page load. A test racing one of
those can pass and fail on the same seed. Flake Score's repeats tell the two
apart.

## Flags

| Flag | What happens | What it trains |
|---|---|---|
| `popups` | A cookie banner blocks the page until a choice is made. A promo modal appears 1–6 s after load (seed-determined), closes only via its own buttons, and keeps coming back — each gap twice as long as the previous one, capped at 20 s (e.g. 3 s, 6 s, 12 s, 20 s, 20 s…). Reset Chat asks for confirmation with a native `confirm()`. | `storageState` / `addInitScript`, `page.addLocatorHandler()`, `page.on('dialog')` |
| `latency` | Replies take 0.1–4 s. | Avoiding `waitForTimeout`, assertion timeouts |
| `flaky-network` | Some sends fail: the message is marked "Not delivered" and a Retry button appears. Never fails twice in a row. | `expect.toPass()`, retry flows, no duplicates after retry |
| `rate-limit` | More than 3 sends in 10 s starts a cooldown with a countdown; the input is disabled. | `page.clock` (`install`, `fastForward`) |
| `toasts` | "Message sent" / "Chat cleared" notifications that vanish after 1.5 s. | Asserting on short-lived elements |
| `unstable-dom` | The History list re-mounts every 3 s. Search results come back shuffled (stable per seed and query). | Locators vs element handles; `filter({ hasText })` vs `.nth()` |
| `no-testids` | All `data-testid` attributes are removed (except on the hard mode controls). | Role, label and text locators |
| `moving-target` | The Send button slides in when enabled; a "press Enter" tip covers it until dismissed. | Actionability checks, "element intercepts pointer events" |
| `iframe-widget` | Three large forms, each inside its own iframe with its own "rate us" modal: support (bottom right), "What's your question?" (bottom left) and an email-for-10%-discount form (bottom centre). Each has a close button on the page (outside the iframe) that appears after 0 s, 2 s and 4 s respectively. Ticket numbers are seed-determined. | `frameLocator()` |
| `shadow-dom` | A `<feedback-widget>` custom element with its UI in an open shadow root. | Locators piercing shadow DOM (XPath does not) |
| `files` | Attach a file to a message; export history as `chat-history.json`. | `setInputFiles()`, `waitForEvent('download')` |
| `multi-tab` | "Open history in new window" button; history syncs live between tabs via `BroadcastChannel`. | `context.waitForEvent('page')`, multi-page tests |
| `slow-history` | History loads behind skeletons, then pages in 5 items at a time on scroll. | Waiting for loading states, infinite scroll |
| `time` | Relative timestamps ("2 minutes ago") and Today/Yesterday dividers. | `page.clock`, `timezoneId` / `locale` |
| `clipboard` | Copy button on assistant replies. | `context.grantPermissions(['clipboard-read'])` |

## Flag sets

Themed bundles, each one story and one block of Playwright skills. A set's
contents never change once published, so a test written against a set keeps
meaning the same thing; a new flag goes into a new set. `all` is the only
name whose contents grow.

| Set | Flags | Story | Trains |
|---|---|---|---|
| `bad-network` | `latency`, `flaky-network`, `rate-limit`, `slow-history`, `toasts` | Mobile data and an overloaded backend | Waiting without `waitForTimeout`, `toPass`, `page.clock` |
| `tricky-dom` | `unstable-dom`, `no-testids`, `moving-target`, `iframe-widget`, `shadow-dom` | A legacy front end with third-party widgets | Role locators, `frameLocator`, shadow DOM, actionability |

The ⚙ panel has a button per set.

## Testing tips

- Skip the cookie banner by setting the consent key before the page loads:

  ```ts
  await page.addInitScript(() =>
    localStorage.setItem('chat-lab:hard-mode:consent', 'accepted'),
  )
  ```

- Dismiss the promo modal whenever it shows up:

  ```ts
  const promo = page.getByRole('dialog', { name: 'Upgrade to Chat Lab Pro' })
  await page.addLocatorHandler(promo, async (dialog) => {
    await dialog.getByRole('button', { name: 'Maybe later' }).click()
  })
  ```

  The handler keeps working for every reappearance. Without it, a test that
  passes quickly can still break once it runs long enough to hit the next
  showing.

- Timers (promo delay, rate-limit countdown, toasts, relative time) use
  `setTimeout` / `setInterval` / `Date`, so `page.clock` controls all of them.
  CSS animations (`moving-target`, skeleton shimmer) are not affected by it.
- Pin a seed in the URL while debugging; drop it (or try several) to check
  that a test doesn't depend on one lucky sequence.

## Events, marker and the test fixture

Hard mode reports what it does, so a failing run can be explained and a test
runner can check what it actually ran with.

- **Marker:** `<html data-hard-mode="seed=4;flags=latency,toasts">` (flags
  sorted), or `data-hard-mode="off"`.
- **Events:** each one is a console line, logged with `console.debug` (hidden
  in DevTools by default, still delivered to `page.on('console')`):

  ```
  [hard mode] event popups:promo-shown {"iteration":0,"afterMs":3120}
  ```

  `config` is emitted on every page load and every change, enabled or not.
  The others: `latency`, `flaky-network:failed`, `rate-limit:hit`,
  `toasts:shown`, `popups:cookie-shown`, `popups:cookie-decided`,
  `popups:promo-shown`, `popups:promo-closed`. The last 200 are also kept in
  `window.__hardMode.events` for poking at by hand (reset on every load).
- **Turning it on in a test — always explicit.** Lessons and other tests run
  in normal mode and never touch hard mode. A hard mode test imports `test`
  and `expect` from `e2e/hard-mode/test.ts` and asks for it:

  ```ts
  import { expect, test } from '../hard-mode/test'

  test.use({ hardMode: { flags: 'bad-network' } }) // a set, or 'popups,latency'

  test('the message gets through after a network failure', async ({ page }) => {
    // …
  })
  ```

  `seed` (1–10) is optional — `{ flags: 'popups', seed: 4 }` pins one
  scenario. Left out, the run's `hardSeed` is used: 1 in a plain
  `npm run test:e2e`, each of 1–10 in turn under [Flake Score](#flake-score).
  Pin a seed only for a test about one specific scenario.

  For such a test the fixture turns hard mode on before the app's first load
  (once per browser context — a test that then changes flags in the UI and
  reloads keeps its change), checks every page load against the config it
  asked for — a test that ends up with other flags (say, it opened
  `/?hard=off`) gets a `hard-mode-mismatch` annotation instead of passing
  silently — and keeps a journal of hard mode events from every page
  (`hardModeJournal`), attached to the report when the test fails. Without
  `hardMode` the fixture does nothing.

  Use the option, not `page.goto('/?hard=…&seed=…')`: a seed in the URL
  can't be varied by Flake Score.

## Flake Score

Runs the hard mode tests once per seed and scores how many seeds came out
stable:

```bash
npm run flake-score                                   # the hard mode suite, e2e/hard-mode/
npm run flake-score -- e2e/hard-mode/bad-network.spec.ts
```

It never turns hard mode on itself. Each seed is a Playwright project
(`seed-1` … `seed-10`) that only sets `hardSeed`; every test turns hard mode
on with its own `hardMode` option, as above. A test that doesn't is run
normally and left out of the score. Every seed runs twice (`--repeats`),
with no retries. Failures are sorted into:

| Kind | Means | What to do |
|---|---|---|
| **Seed-dependent** | Fails every run of some seeds | Replay with the command in the report, or open `/?hard=<flags>&seed=<n>` |
| **Timing-dependent** | Fails only some runs of a seed | A race against `latency` / timers; the seed alone won't replay it — look at the trace |
| **Fails on every seed** | Doesn't handle its flags at all (e.g. `getByTestId` under `no-testids`) | Not counted as flaky; fix the test first |
| **Not verified** | Ran with another config than it asked for (e.g. opened `/?hard=off`) | Not counted |
| **Normal test** | Didn't turn hard mode on | Not counted |

The score is the share of seeds on which every counted test passed every
run. The report goes to `flake-score-report/`: `flake-score.md`,
`flake-score.json`, `flake-score-badge.json` (a [shields.io endpoint
badge](https://shields.io/badges/endpoint-badge) — publish the file at a
public URL, e.g. a `badges` branch or a gist, to use it in a README), and one
trace per failing test.

Options: `--config=<file>` (default `playwright.config.ts`, or
`lessons/playwright.config.ts` for filters under `lessons/`),
`--seeds=<n>` (only the first n; default all 10), `--seed-list=<a,b>`,
`--repeats=<n>` (default 2), `--workers=<n|%>`,
`--server=preview|dev|none`, `--port=<n>`, `--min=<percent>` (exit 1 below
it), `--headed`.

- **Server:** by default a production build on `vite preview` — the dev
  server compiles on first request and adds flakiness of its own under
  parallel load. If you already run `npm run dev` on 5173, pass `--port=5180`
  (tests that hard-code `http://localhost:5173` won't follow) or
  `--server=dev` to reuse it.
- **CI:** comment `flake-score` (the hard mode suite) or `flake-score <path>`
  on a PR — the PR's author or a maintainer. It scores all 10 seeds × 2 runs
  and posts the report as a comment (`.github/workflows/flake-score.yml`
  runs the PR's code read-only; `flake-score-comment.yml` posts from the
  artifact).

## Storage keys

Set these before the page loads (`storageState` or `addInitScript`) to skip
an overlay. They're public: never renamed, see `hardMode/dismissal.ts`.

| Key | Storage | Values | Effect |
|---|---|---|---|
| `chat-lab:hard-mode` | `localStorage` | `{"enabled":true,"flags":[...],"seed":4}` | The hard mode config itself |
| `chat-lab:hard-mode:consent` | `localStorage` | `accepted` / `rejected` | Cookie banner doesn't show |
| `chat-lab:hard-mode:applied-by-test` | `localStorage` | `1` | Set by the test fixture once it has applied a test's config; the app ignores it |

## Code layout

| Path | Purpose |
|---|---|
| `hardMode/hardModeConfig.ts` | Flag list, URL/storage parsing, precedence |
| `hardMode/rng.ts` | Keyed, stateless random numbers |
| `hardMode/HardModeProvider.tsx`, `hardModeContext.ts`, `useHardMode.ts` | Context, `isOn(flag)`, `rand(...keys)`, `useTid()`, toasts |
| `hardMode/withHardMode.ts` | Wraps the reply source with latency, flaky network and rate limit |
| `hardMode/HardModeToggle.tsx` | Toggle, seed badge and flag panel |
| `hardMode/overlays/` | Cookie banner, promo modal, toasts |
| `hardMode/widgets/` | Support/question/discount iframes, shadow-DOM feedback widget |
| `hardMode/promoSchedule.ts` | Promo modal delays: seeded first delay, doubling after each close, capped at 20 s |
| `hardMode/relativeTime.ts` | "N minutes ago" and day labels |
| `hardMode/telemetry.ts` | Event lines, the `data-hard-mode` marker, `window.__hardMode` — shared with the e2e fixture |
| `hardMode/dismissal.ts` | "Shown once" storage keys for overlays |
| `../e2e/hard-mode/test.ts` | Fixture for hard mode tests: the `hardMode` option turns it on, plus config check and event journal |
| `../e2e/hard-mode/storage.ts` | Stored-config JSON and `replayUrl()` — Node-safe |
| `../e2e/hard-mode/*.spec.ts` | The hard mode suite — what `npm run flake-score` runs by default |
| `../config/flake-score.config.ts` | Wraps a suite's config: one project per seed (sets `hardSeed` only), `vite preview`, no retries |
| `../config/flakeScore.ts`, `flakeScoreReporter.ts` | Scoring and the three kinds of failure; writes the report |
| `../scripts/flake-score.ts` | `npm run flake-score` — options, seeds, exit code |
| `lib/replyService.ts` | The plain (non-hard-mode) reply logic, extracted from `ChatWindow` |

Network-shaped chaos lives in the `withHardMode()` wrapper, not in
`ChatWindow` — the component only handles the resulting error, Retry and
cooldown states. Test ids go through `useTid()` (`{...tid('send-button')}`)
so `no-testids` can strip them.

Unit tests: `hardMode/*.test.ts` — off by default, seed determinism,
latency / failure / rate-limit behaviour, promo schedule, relative-time
formatting.
