import { test } from '@playwright/test'

/**
 * Homework 3 — Assertions & auto-waiting
 *
 * Screen under test: Message history — the same screen as demo.spec.ts,
 * at "/history".
 *
 * Complete the test below:
 *   1. Go to "/history" directly (no messages sent yet) and assert:
 *        - the delete button (data-testid="delete-history-button") is disabled
 *        - there are 0 elements matching "li.history-day__item" (toHaveCount)
 *   2. Go to the chat page ("/") and send three messages, waiting for each
 *      reply before sending the next:
 *        - "Gravity always wins"
 *        - "How odd"
 *        - "If only"
 *   3. Go back to Message history and assert:
 *        - there are now exactly 3 "li.history-day__item" elements
 *        - the delete button is enabled
 *   4. Using expect.soft (so both checks run even if one fails), assert
 *      that the first history entry's two .history-exchange__text elements
 *      read "Gravity always wins" and
 *      "Gravity is just the Earth being clingy in a scientifically dignified way."
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 3: Assertions & auto-waiting', () => {
  test('history starts empty, then fills up and enables delete as messages are sent', async () => {
    test.fixme()

    // Write your code here
  })
})
