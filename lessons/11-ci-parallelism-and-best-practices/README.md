# Lesson 11 — CI, Parallelism & Best Practices

## Recap

Ten lessons in, you know how to write a single test well. This last one is
about what changes once that test is one of hundreds, run by a machine you
can't watch, on a schedule you don't control — and it closes with a
checklist of everything the course has actually been arguing for along the
way.

## Running in CI

This repo has two real, current examples worth reading directly:

- `.github/workflows/ci.yml` runs `npm run lint` and `npm run build` on
  every push and PR — but not this course's tests, or `e2e/`'s. Wiring
  Playwright into CI needs a couple of things a local run doesn't: browsers
  installed on the runner (`npx playwright install --with-deps`), and a
  config that behaves differently when `process.env.CI` is set.
- The root `playwright.config.ts` (for `e2e/`) already does the second
  part: `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 :
  1`, `forbidOnly: !!process.env.CI` (a stray `test.only` left in by
  accident fails the CI run instead of silently only running that one
  test). `lessons/playwright.config.ts` picked up the same pattern as part
  of this lesson — see its `retries` and `headless` lines: this course's
  tests default to **headed**, so you can watch them, but a CI runner has
  no display to show a headed browser on. Hardcoding `headless: false`
  would simply fail there; `headless: !!process.env.CI` fixes that without
  changing anything about running it locally.

## Workers & sharding

`--workers=N` runs test *files* in parallel, across N processes. `--shard=1/3`
(paired with `--shard=2/3`, `--shard=3/3` on other machines) splits the
whole suite across separate CI runners entirely — the way a big suite stays
fast as it grows, instead of one machine running everything in sequence.

Neither is free: they only work if tests don't depend on each other or on
shared, mutable state. `lessons/playwright.config.ts` sets `workers: 1` on
purpose, so a test failure's output isn't interleaved with three other
tests' output while you're still learning to read it — but every test in
this course has still been written to be parallel-safe regardless (the
demo's last two tests say so explicitly), because each gets its own fresh
`page` and browser context (Lesson 8) by default. That's not a coincidence;
it's the property `--workers`/`--shard` require to be safe to turn on at
all.

## Retries and `testInfo.retry`

`retries: N` (config, CLI `--retries`, or `test.describe.configure({
retries })` for one block, as the demo does) reruns a failed test up to N
times before calling it failed for real. `testInfo.retry` tells a test
which attempt it's currently on (`0` the first time) — the demo's first
test uses it to simulate a flake deterministically, so you can watch the
mechanism work without waiting for a real one to happen.

One thing worth noticing in the demo's output: a test that fails once and
then passes on retry is reported as **1 flaky** — a third status, distinct
from both "passed" and "failed." Playwright doesn't pretend the failure
didn't happen; it just doesn't fail the whole run over a rescued one
either.

## Flaky test strategies

Retries are a safety net, not a fix — they buy time, they don't diagnose
anything. Lesson 5's demo found a real example of the difference: an
`e2e/` page object's locator could transiently match a "Thinking…"
placeholder instead of the real reply, and the original code masked it with
a hardcoded `page.waitForTimeout(1000)` instead of fixing the locator. A
timeout like that "works" the same way retries can — by giving a race
condition enough time to resolve itself most of the time — right up until a
slower CI runner makes "most of the time" not often enough. The actual fix
was narrowing the locator so it could never match the wrong element, not
waiting longer and hoping.

If a real flake can't be fixed immediately, `test.fixme()` (used throughout
this course for unfinished homework) or `test.skip()` mark it as known and
excluded, so it stops eroding trust in the rest of the suite while it's
diagnosed properly, without deleting the coverage it represents.

## Test design best practices — a checklist

Everything below has a lesson behind it, not just an opinion:

- **Prefer web-first, auto-retrying assertions** (`expect(locator).toBe...`)
  **over manual reads and arbitrary waits** — Lesson 3, and the same real
  bug Lesson 5 found and fixed.
- **Target elements by role or `data-testid`, not brittle CSS** — Lesson 2.
- **Extract shared setup into fixtures, not copy-pasted helpers** —
  Lesson 6.
- **Extract a screen's locators and actions into a page object once it's
  used by more than a couple of tests** — Lesson 7.
- **Don't assume two tests share state — each gets its own context, so
  don't rely on ordering** — Lesson 8, and this lesson's own demo.
- **Mock the network for determinism** — a test that depends on a real
  backend's timing or data is a test that depends on the network being
  fast, reachable, and in the right state — Lesson 9.
- **When something fails and you don't know why, reach for a trace before
  adding a `waitForTimeout`** — Lesson 10, and again, Lesson 5.

## The screen for this lesson: Chat & Search

Same locators as Lessons 1 and 2 — nothing new about the screens
themselves. What's new is everything *around* the tests that use them.

## Now

1. Read and run `demo.spec.ts` — pay attention to the summary line at the
   end (`1 flaky`, not `1 failed`).
2. Open `homework.spec.ts` and complete both exercises described there —
   your own retry-rescued test, and a familiar flow reorganized with
   `test.step()`.
3. That's the course. If you want to see it all working together, revisit
   an early lesson's `demo.spec.ts` with fresh eyes — most of what looked
   like new syntax back then is really one of the practices above, just not
   named yet.
