import { test } from '@playwright/test'

/**
 * Homework 6 — Hooks & fixtures
 *
 * Screens under test: Chat ("/") to seed messages, then Search ("/search")
 * to find them — the same screens as Lesson 2, now organized with a custom
 * fixture and a beforeEach instead of a helper function called manually in
 * every test.
 *
 * Complete the exercise below:
 *   1. Above `test.describe`, build your own fixture named `sendMessage`,
 *      typed `(text: string) => Promise<void>` (see demo.spec.ts's
 *      `sendMessage` fixture for the pattern: `base.extend<Fixtures>({...})`
 *      assigned to a local `test`, which you then use instead of the
 *      `test` imported from '@playwright/test'). Its setup should `use()`
 *      an async function that, given `text`:
 *        - waits for data-testid="chat-input" to be enabled (15s timeout)
 *        - fills it with `text`
 *        - clicks data-testid="send-button"
 *        - waits for the last data-testid="message-assistant" to be visible
 *   2. Add a `test.beforeEach` (at the `test.describe` level) that:
 *        - goes to "/"
 *        - uses your `sendMessage` fixture to send "Spaceships are neat",
 *          then "Historians unite"
 *        - clicks data-testid="nav-tab-search" and asserts the URL matches
 *          /\/search$/
 *   3. First test: search (`page.getByPlaceholder('Type words from a
 *      message…')`) for "Spaceships". Assert exactly 1 result
 *      (`li.search-results__item`), and that its two
 *      `.history-exchange__text` elements read "Spaceships are neat" and
 *      "Socks in the dryer are off-chain NFTs with zero provenance."
 *   4. Second test: search for "asteroids" (never sent). Assert there are 0
 *      results and "No matches for your search." is visible.
 *
 * Delete each test's `test.fixme()` line once it passes.
 */
test.describe('Homework 6: Hooks & fixtures', () => {
  test('searching finds a message sent via the sendMessage fixture', async () => {
    test.fixme()

    // Write your code here
  })

  test('searching for text that was never sent shows no matches', async () => {
    test.fixme()

    // Write your code here
  })
})
