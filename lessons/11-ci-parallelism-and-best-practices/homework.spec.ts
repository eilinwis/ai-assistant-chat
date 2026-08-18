import { test } from '@playwright/test'

/**
 * Homework 11 — CI, parallelism & best practices
 *
 * Screens under test: no screen for the first exercise (it's pure retry
 * mechanics, like demo.spec.ts's); Chat ("/") → Search ("/search") for the
 * second, organized into test.step()s.
 *
 * Complete the exercise below. It's split into two tests — write each one,
 * deleting its `test.fixme()` line once it passes.
 *
 * Note on Test 1: once it's complete, running it won't print a plain
 * "passed" — it fails on attempt 1, then passes on the retry, so Playwright
 * reports it as **1 flaky**, not a failure. That's the whole point: it
 * proves the retry configuration actually rescued a failing attempt,
 * without pretending the failure never happened.
 */
test.describe('Homework 11: CI, parallelism & best practices', () => {
  /**
   * Test 1 — a test that needs exactly one retry
   *   1. Wrap it in its own `test.describe(...)` block and call
   *      `test.describe.configure({ retries: 1 })` at the top of that
   *      block (see demo.spec.ts for the shape).
   *   2. In the test body, take `testInfo` as the test function's second
   *      argument (the first can stay `{}` if you don't need `page`).
   *   3. If `testInfo.retry === 0`, `throw new Error(...)` with any
   *      message — that's what makes the first attempt fail on purpose.
   *   4. After that check, assert `testInfo.retry` is exactly `1`.
   */
  test('fails once, then passes', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 2 — test.step() on a familiar flow
   *   1. `await test.step('send a message from Chat', async () => { ... })`
   *      — inside it, go to "/", wait for data-testid="chat-input" to be
   *      enabled (15s timeout), send "Ostriches assemble" through the
   *      normal fill+click flow, and wait for the assistant reply.
   *   2. `await test.step('go to Search and look for it', async () => {
   *      ... })` — click data-testid="nav-tab-search", then search
   *      (`getByPlaceholder('Type words from a message…')`) for
   *      "Ostriches".
   *   3. `await test.step('assert exactly one result', async () => { ...
   *      })` — assert `li.search-results__item` has a count of 1.
   */
  test('searching for a sent message, organized into labeled steps', async () => {
    test.fixme()

    // Write your code here
  })
})
