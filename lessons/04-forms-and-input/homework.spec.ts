import { test } from '@playwright/test'

/**
 * Homework 4 — Forms & input
 *
 * Screen under test: Chat — the same screen as demo.spec.ts, at "/".
 *
 * Complete the test below:
 *   1. Go to the chat page and wait for the chat input to be enabled
 *   2. Assert the funny mode checkbox (data-testid="funny-mode-toggle") is
 *      checked, uncheck it and assert it's unchecked, then check it again
 *      and assert it's checked
 *   3. Assert the Send button is disabled when the input holds only
 *      whitespace (e.g. fill it with "    ")
 *   4. Clear the input (it still holds whitespace from the previous step —
 *      pressSequentially() types *into* whatever is already there, it
 *      doesn't replace it). Then, using real keystrokes (pressSequentially /
 *      press — not .fill()), type a two-line message into the chat input:
 *        - line 1: "Variables first"
 *        - Shift+Enter
 *        - line 2: "Then values"
 *      Assert the input's value is exactly "Variables first\nThen values"
 *      before submitting
 *   5. Press Enter to submit. Assert the input is cleared, and that the
 *      assistant's reply is exactly:
 *      "Variables hold hands with values in a strictly platonic scope."
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 4: Forms & input', () => {
  test('toggling funny mode, validating empty input, and submitting via keyboard', async () => {
    test.fixme()

    // Write your code here
  })
})
