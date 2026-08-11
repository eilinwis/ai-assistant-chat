import { test } from '@playwright/test'

/**
 * Homework 2 — Locators & actions
 *
 * Screen under test: Search in chats — the same screen as demo.spec.ts,
 * at "/search".
 *
 * Complete the test below:
 *   1. Go to the chat page ("/") and send two messages, waiting for each
 *      reply before sending the next:
 *        - "Ducks like bread"
 *        - "Programmers unite"
 *   2. Go to the Search screen (click the tab with data-testid "nav-tab-search")
 *   3. Search for "Ducks"
 *   4. Assert exactly one result is shown (li.search-results__item)
 *   5. Within that result, assert the two .history-exchange__text elements
 *      read "Ducks like bread" and
 *      "Ducks think breadcrumbs are cryptocurrency with excellent UX."
 *   6. Clear the search box (fill it with an empty string)
 *   7. Assert the hint "Enter text to search your local history." is visible
 *      again, and that there are no result items
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 2: Locators & actions', () => {
  test('searching finds a sent message, and clearing the query resets the view', async () => {
    test.fixme()

    // Write your code here
  })
})
