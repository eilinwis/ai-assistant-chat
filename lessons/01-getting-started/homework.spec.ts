import { test } from '@playwright/test'

/**
 * Homework 1 — Getting started
 *
 * Screen under test: Chat — the same screen as demo.spec.ts, at "/".
 *
 * "Funny mode" is on by default, so every message gets a canned reply
 * picked by its first letter (see src/data/funnyReplies.ts).
 *
 * Complete the test below:
 *   1. Go to the chat page ("/")
 *   2. Wait for the chat input (getByTestId('chat-input')) to become
 *      enabled — same as the demo. Don't wait on the Send button: it's
 *      disabled both while the app is loading AND whenever it's empty, so
 *      checking it before you've typed anything would wait forever.
 *   3. Send the message "Queue up the tests"
 *   4. Assert the assistant's reply is exactly:
 *      "Queue is just Q with four impatient friends standing behind it."
 *   5. Send a second message: "Programmers unite"
 *   6. Assert its reply is exactly:
 *      "Programmers don’t panic; we just `console.log` our feelings."
 *      (note: that's a curly apostrophe ’, not a straight one — copy it
 *      from here or from src/data/funnyReplies.ts to get an exact match)
 *
 * Hint: after sending a second message, there are two elements matching
 * getByTestId('message-assistant') — use `.first()` / `.last()`, or `.nth(0)`
 * / `.nth(1)`, to pick the one you want.
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 1: Getting started', () => {
  test('sending two messages shows their expected replies', async () => {
    test.fixme()

    // Write your code here
  })
})
