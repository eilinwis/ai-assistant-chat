import { test } from '@playwright/test'

/**
 * Homework 9 — Network interception & API mocking
 *
 * Screen under test: Chat ("/") — the same screen as demo.spec.ts, mocking
 * the two remaining endpoints it didn't cover: POST /api/reset, and a
 * deliberately slow POST /api/chat.
 *
 * Complete the exercise below. It's split into two tests — write each one,
 * deleting its `test.fixme()` line once it passes.
 */
test.describe('Homework 9: Network interception & API mocking', () => {
  /**
   * Test 1 — mocking Reset Chat
   *   1. Register a route for "**\/api/messages" that fulfills with
   *      `{ messages: [] }` (register every route before `page.goto`).
   *   2. Register a route for "**\/api/reset" that fulfills with
   *      `{ status: 'ok' }` — that's the only response shape
   *      `resetChat()` (src/api/chatApi.ts) accepts as success.
   *   3. Go to "/", wait for data-testid="chat-input" to be enabled (15s
   *      timeout), then send "Bananas are great" through the normal
   *      fill+click flow (funny mode stays on — no need to mock
   *      POST /api/chat for this test) and wait for the assistant reply to
   *      appear.
   *   4. Click data-testid="reset-button" — clicking it clears the on-screen
   *      thread immediately either way (it doesn't wait on the network
   *      call), so pair the click with `page.waitForResponse('**\/api/reset')`
   *      (same `Promise.all([...])` shape demo.spec.ts uses for
   *      POST /api/chat) to actually confirm *your mock* was hit, and
   *      assert its status is 200.
   *   5. Assert there are 0 data-testid="message-user" elements, 0
   *      data-testid="message-assistant" elements, and that "No messages
   *      yet." is visible again.
   */
  test('mocking a successful POST /api/reset clears the chat', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 2 — a slow response and the loading indicator
   *   1. Register a route for "**\/api/messages" that fulfills with
   *      `{ messages: [] }`.
   *   2. Register a route for "**\/api/chat" whose handler *waits* (e.g.
   *      `await new Promise((r) => setTimeout(r, 500))`) before calling
   *      `route.fulfill(...)` with a mocked `{ reply: {...} }` — an
   *      assistant `Message` (id, role: 'assistant', content, timestamp)
   *      of your choosing.
   *   3. Go to "/", wait for the chat input to be enabled, then uncheck
   *      data-testid="funny-mode-toggle" (a real request only fires with
   *      funny mode off).
   *   4. Fill the chat input with any text and click Send.
   *   5. Assert data-testid="loading-indicator" is visible — this has to
   *      win the race against your 500ms delay, so assert it right after
   *      clicking Send, before any other assertion.
   *   6. Assert the last data-testid="message-assistant" has the exact
   *      text you mocked in step 2.
   *   7. Assert data-testid="loading-indicator" now has a count of 0.
   */
  test('a delayed POST /api/chat response shows the loading indicator until it resolves', async () => {
    test.fixme()

    // Write your code here
  })
})
