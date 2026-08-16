# Lesson 8 — Navigation, Tabs & Browser Contexts

## Recap

Every test so far has used one `page`, in the browser context Playwright
hands you by default. This lesson looks at what that context actually is —
and what happens when you add a second tab, or a second context entirely.

## The context hierarchy

- A **browser** can host many **contexts**. A context is like a separate
  browser profile: its own cookies, its own `localStorage`, `sessionStorage`,
  and permissions — completely isolated from every other context.
- A context can host many **pages** (tabs). Pages in the *same* context
  share that context's cookies and storage.

The `page` fixture you've used since Lesson 1 comes with a `context` fixture
attached to it — `page.context()` (or just requesting `context` in your
test's argument list, as the demo does) gets you the context that page
belongs to.

## Opening more tabs and contexts

- `context.newPage()` — a new tab in the **same** context. Same storage as
  every other page in it.
- `browser.newContext()` — a whole new, empty context: no cookies, no
  storage. `await context.newPage()` on *that* gives you a page starting
  from a clean slate.

This app's own Help screen states the isolation rule as user-facing
documentation: "Another browser, incognito mode, or clearing site data will
not show the same archive." The demo's second test is that exact claim,
verified with `browser.newContext()`.

One timing detail worth noticing: this app reads its chat history from
`localStorage` once, when the history provider first mounts — it doesn't
watch for storage changes afterward. So a second tab only sees a message
sent in the first tab if it navigates (or reloads) *after* that message was
saved, not before.

## Reusing storage state

`await context.storageState()` serializes a context's cookies and storage
into a plain object. Handing that to `browser.newContext({ storageState })`
starts a *new* context already in that state — no UI steps needed to get
there. Real-world apps usually use this to skip a login flow (log in once,
save the state, reuse it in every test); here, there's no login, but the
same trick skips re-sending a chat message just to get history onto the
Search or Message-history screen.

## Popups and cookies — for reference

Neither shows up in this app, so there's nothing here to run a live demo
against, but two more tools worth knowing:

- **Popups / `target="_blank"` links**: `const [popup] = await Promise.all([
  context.waitForEvent('popup'), page.getByRole('link', { name: '...'
  }).click(), ])` — `waitForEvent('popup')` resolves with the new `Page` the
  moment it opens, which you can then interact with like any other page.
- **Cookies**: `context.cookies()` reads them, `context.addCookies([...])`
  sets them before a page ever loads (handy for pre-seeding an auth token
  without going through a login form).

## The screens for this lesson: Chat, Search & Message history

Same locators as Lessons 1–3 — `chat-input`/`send-button`, the Search
screen's `getByPlaceholder('Type words from a message…')` and
`li.search-results__item`, and Message history's `li.history-day__item`.
What's new is that some of them now belong to a `Page` this test opened
itself, not the one it started with.

## Now

1. Read and run `demo.spec.ts` — three tests, three different relationships
   between pages, contexts, and storage.
2. Open `homework.spec.ts` and complete both exercises described there —
   the same Chat → Search flow as Lesson 2's homework, now crossing browser
   contexts.
