import { test } from '@playwright/test'

/**
 * Homework 8 — Navigation & browser contexts
 *
 * Screens under test: Chat ("/") to seed a message, then Search ("/search")
 * to look for it — the same screens as Lesson 2, now crossing browser
 * contexts instead of staying on one page.
 *
 * A `sendMessage(page, text)` helper (same shape as demo.spec.ts's) is
 * yours to write once and reuse in both tests below.
 *
 * Complete the exercise below. It's split into two tests — write each one,
 * deleting its `test.fixme()` line once it passes.
 */
test.describe('Homework 8: Navigation & browser contexts', () => {
  /**
   * Test 1 — isolation
   *   1. On `page`, go to "/" and send "Spaceships are neat" (wait for
   *      data-testid="chat-input" to be enabled first, same as every
   *      earlier lesson's helper).
   *   2. Open a brand-new, separate context: `await browser.newContext()`,
   *      then `await newContext.newPage()`.
   *   3. On that new page, go to "/search" and search
   *      (`getByPlaceholder('Type words from a message…')`) for
   *      "Spaceships".
   *   4. Assert "No matches for your search." is visible, and that there
   *      are 0 `li.search-results__item` elements — the new context has
   *      never seen this message.
   *   5. Close the context you opened in step 2.
   */
  test('fresh browser context never sees search results of another context', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 2 — reusing storageState
   *   1. On `page`, go to "/" and send "Programmers unite".
   *   2. Capture the current context's storage: `await context.storageState()`.
   *   3. Open a new context *with that storage*:
   *      `await browser.newContext({ storageState })`, then a new page on
   *      it.
   *   4. On that page, go straight to "/search" (no chat message sent in
   *      this context) and search for "Programmers".
   *   5. Assert exactly 1 result, and that its first
   *      `.history-exchange__text` reads "Programmers unite" — found
   *      without ever sending the message in this context.
   *   6. Close the context you opened in step 3.
   */
  test('reusing a saved storageState finds a message without resending it', async () => {
    test.fixme()

    // Write your code here
  })
})
