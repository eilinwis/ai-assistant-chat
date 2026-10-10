# Hard Mode

An opt-in mode that makes Chat Lab behave like a messy real-world product, for
practising realistic Playwright e2e testing. **Off by default** — existing
tests and lessons are unaffected.

## Enabling it

- **UI:** the "Hard mode" toggle in the top-left corner; ⚙ opens a panel to
  pick individual flags and set the seed.
- **URL:** `/?hard=all&seed=42`, or a subset: `/?hard=popups,latency&seed=42`.
  `?hard=off` turns it off.
- **Persistence:** saved in `localStorage` under `chat-lab:hard-mode`, so it
  survives client-side navigation (which drops the query string).

Precedence: `?hard=` in the URL, then the stored config, then off. A bare
`?seed=` never turns hard mode on.

## Seed and determinism

All randomness is derived from the seed: same seed + same actions = same
delays, failures and popup timing. The seed is shown as a "seed N" badge next
to the toggle and logged to the console, so a failing run can be replayed.

Every random value is a pure function of the seed and a key —
`rand(seed, 'latency', attempt)` (see `hardMode/rng.ts`). There is no shared
random stream, so the results don't depend on render count (StrictMode) or on
the order in which features ask for numbers.

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

- **Marker:** `<html data-hard-mode="seed=42;flags=latency,toasts">` (flags
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
- **Fixture (optional):** import `test` and `expect` from
  `e2e/hard-mode/test.ts` instead of `@playwright/test`. Every test then
  collects the event journal from all pages of its context
  (`hardModeJournal`) and attaches it to the report when it fails. With the
  `hardMode` option set, the fixture also checks every page load against it:
  a test that ends up with other flags (say, it opened `/?hard=off`) gets a
  `hard-mode-mismatch` annotation instead of passing silently.

  ```ts
  import { hardModeStorageState, test } from '../hard-mode/test'

  const run = { seed: 42, flags: ['popups', 'latency'] }
  test.use({
    hardMode: run, // what to check against
    storageState: hardModeStorageState('http://localhost:5173', run), // how to turn it on
  })
  ```

  The fixture never turns hard mode on by itself — `storageState` does, and
  works the same for tests that don't import the fixture.

## Storage keys

Set these before the page loads (`storageState` or `addInitScript`) to skip
an overlay. They're public: never renamed, see `hardMode/dismissal.ts`.

| Key | Storage | Values | Effect |
|---|---|---|---|
| `chat-lab:hard-mode` | `localStorage` | `{"enabled":true,"flags":[...],"seed":42}` | The hard mode config itself |
| `chat-lab:hard-mode:consent` | `localStorage` | `accepted` / `rejected` | Cookie banner doesn't show |

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
| `../e2e/hard-mode/test.ts` | Optional Playwright fixture: event journal, config check, `hardModeStorageState()` |
| `lib/replyService.ts` | The plain (non-hard-mode) reply logic, extracted from `ChatWindow` |

Network-shaped chaos lives in the `withHardMode()` wrapper, not in
`ChatWindow` — the component only handles the resulting error, Retry and
cooldown states. Test ids go through `useTid()` (`{...tid('send-button')}`)
so `no-testids` can strip them.

Unit tests: `hardMode/*.test.ts` — off by default, seed determinism,
latency / failure / rate-limit behaviour, promo schedule, relative-time
formatting.
