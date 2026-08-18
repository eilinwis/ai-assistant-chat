import { test } from '@playwright/test'

/**
 * Homework 10 — Debugging & visual tools
 *
 * Screens under test: Chat ("/") → Search ("/search") for the trace, and
 * Playground ("/playground") for the screenshot — reusing flows from
 * earlier lessons, capturing evidence about them this time instead of just
 * asserting on them.
 *
 * You'll need `import fs from 'node:fs'` (for `fs.existsSync` /
 * `fs.statSync`) alongside the `@playwright/test` import once you start
 * writing — demo.spec.ts shows both APIs in action.
 *
 * Complete the exercise below. It's split into two tests — write each one,
 * deleting its `test.fixme()` line once it passes.
 */
test.describe('Homework 10: Debugging & visual tools', () => {
  /**
   * Test 1 — tracing a multi-screen flow
   *   1. `await context.tracing.start({ screenshots: true, snapshots: true })`.
   *   2. Go to "/", wait for data-testid="chat-input" to be enabled (15s
   *      timeout), send "Ducks like bread" through the normal fill+click
   *      flow, and wait for the assistant reply to appear.
   *   3. Click data-testid="nav-tab-search", search
   *      (`getByPlaceholder('Type words from a message…')`) for "Ducks",
   *      and assert exactly 1 result (`li.search-results__item`).
   *   4. `const tracePath = testInfo.outputPath('search-trace.zip')`, then
   *      `await context.tracing.stop({ path: tracePath })`.
   *   5. Assert `fs.existsSync(tracePath)` is `true`.
   */
  test('tracing a Chat -> Search flow produces a trace file', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 2 — an element screenshot
   *   1. Go to "/playground" and assert
   *      data-testid="playground-section-gallery" is visible.
   *   2. `const imagePath = testInfo.outputPath('gallery.png')`.
   *   3. Screenshot just the image element:
   *      `await page.getByTestId('gallery-main-image').screenshot({ path: imagePath })`.
   *   4. Assert `fs.existsSync(imagePath)` is `true`, and that
   *      `fs.statSync(imagePath).size` is greater than `0` — proving the
   *      file isn't just present but actually has image data in it.
   */
  test('a locator screenshot of a Playground widget saves a non-empty image', async () => {
    test.fixme()

    // Write your code here
  })
})
