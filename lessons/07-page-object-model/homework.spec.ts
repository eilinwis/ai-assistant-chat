import { test } from '@playwright/test'

/**
 * Homework 7 — Page Object Model
 *
 * Screens under test: Chat ("/") to seed messages, then Message history
 * ("/history") — the same screens as Lesson 3, now organized as page
 * objects instead of raw locators.
 *
 * Complete the exercise below:
 *   1. Finish `pages/HistoryPage.ts` — follow the TODO comments in that
 *      file (it currently only stores `page`; it needs two locators and a
 *      `goto()` method).
 *   2. Import `ChatPage` (from './pages/ChatPage') and `HistoryPage` (from
 *      './pages/HistoryPage') above.
 *   3. In the test below (add `{ page }` to its argument list):
 *        - construct `new ChatPage(page)`, call `.goto()`, then
 *          `.sendMessage('Gravity always wins')` and
 *          `.sendMessage('How odd')`
 *        - construct `new HistoryPage(page)`, call `.goto()`, and assert
 *          the page's URL matches /\/history$/ (you'll need `expect` too)
 *        - assert `historyPage.historyItems` has a count of 2
 *        - assert `historyPage.deleteButton` is enabled
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 7: Page Object Model', () => {
  test('sent messages show up as history entries via page objects', async () => {
    test.fixme()

    // Write your code here
  })
})
