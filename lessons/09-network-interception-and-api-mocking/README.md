# Lesson 9 — Network Interception & API Mocking

## Recap

Every earlier lesson used "Funny mode" (on by default) specifically to
avoid needing a backend — sending a message picked a canned reply locally,
no network request involved. This repo genuinely has no backend included
(see `src/api/chatApi.ts`): with funny mode off, or when the app loads and
tries `GET /api/messages`, or when you click **Reset Chat**, those requests
really do go out — and, with nothing listening, really do fail. This lesson
stops working around that and starts controlling it directly.

## `page.route()`

`page.route(urlPattern, handler)` intercepts requests matching the pattern
and lets you decide what happens instead of letting them reach the network.
The pattern can be an exact URL, a glob (`'**/api/messages'`, matching any
origin/port), or a regex.

Two things matter about *when* you call it:

- **Register routes before the navigation (or action) that triggers the
  request.** `page.route()` only affects requests made after it's set up —
  it can't retroactively catch one already in flight.
- **The handler decides the outcome.** `route.fulfill({ json: {...} })`
  answers with your own response body (status 200 by default — pass
  `status` for anything else, like the demo's mocked 500). `route.abort()`
  simulates a network failure instead of an HTTP error response.

## What this app expects back

Match the shapes `src/api/chatApi.ts` reads, or the app's own parsing will
quietly produce nothing:

- `GET /api/messages` → `{ messages: Message[] }`
- `POST /api/chat` → `{ reply: Message }`
- `POST /api/reset` → `{ status: 'ok' }` — anything else and
  `resetChat()` throws, same as a real failure would.

(`Message` is `{ id, role: 'user' | 'assistant', content, timestamp }`, see
`src/types/Message.ts`.)

## `waitForResponse`

`page.route()` replaces a request's outcome; `page.waitForResponse(pattern)`
just *observes* one — it resolves with the actual `Response` object once a
matching request completes, giving you its status, headers, or body to
assert on directly. The demo pairs it with the click that triggers the
request via `Promise.all([...])`, the same "start waiting before you act"
shape `waitForEvent('popup')` used in Lesson 8 — `waitForResponse` after the
click could miss a response that resolves faster than your code reaches the
`await`.

## Loading, error, and empty states

Three UI states this screen has, all driven entirely by how a mocked
response behaves:

- **Loading**: while a request is in flight, `data-testid="loading-indicator"`
  ("Thinking…") is on screen. A route handler that `await`s a delay before
  `route.fulfill(...)` gives a test a reliable window to assert that.
- **Error**: fulfilling with a non-ok status (or `route.abort()`) drives the
  same `data-testid="error-message"` a real failure would.
- **Empty**: fulfilling `GET /api/messages` with `{ messages: [] }`
  reproduces "no history on this account yet" without needing an actual
  empty account anywhere.

## The screen for this lesson: Chat

Same screen and locators as Lessons 1 and 4 —
`chat-input`/`send-button`/`funny-mode-toggle`/`message-user`/
`message-assistant`/`reset-button` — plus two new ones this lesson actually
exercises: `data-testid="loading-indicator"` and
`data-testid="error-message"`.

## Now

1. Read and run `demo.spec.ts` — four tests: seeding history, an empty
   inbox, a mocked successful reply observed with `waitForResponse`, and a
   mocked failure.
2. Open `homework.spec.ts` and complete both exercises described there —
   mocking **Reset Chat**, and asserting the loading state against a
   deliberately slow mocked response.
