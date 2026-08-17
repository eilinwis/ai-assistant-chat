# Lesson 7 — The Page Object Model (POM)

## Recap

By now, several lessons have written `page.getByTestId('chat-input')`,
`page.getByTestId('send-button')`, and the same fill-click-wait sequence.
Lesson 6 pulled that repetition into a fixture. This lesson gives it a home
of its own: a **page object** — a class that owns one screen's locators and
the actions you can take on it, so tests read in terms of the screen
("send a message," "search for X") instead of raw selectors.

## Why POM

Two problems POM is aimed at:

- **Locators live in one place.** If a `data-testid` changes, you fix it in
  the page object once, not in every test that happens to use it.
- **Tests read like a story.** `await chatPage.sendMessage('hi')` says what
  the test is doing; `await page.getByTestId('chat-input').fill('hi'); await
  page.getByTestId('send-button').click()` says how — twice, in every test.

It's not free: an extra layer of indirection means an extra file to open
when something's confusing. For a two-line test, POM is overkill. It starts
paying for itself once several tests share a screen — which, by Lesson 7,
this course's do.

## Structuring a page object

Compare `pages/ChatPage.ts` and `pages/SearchPage.ts` in this lesson's
folder. Both follow the same shape:

- A constructor that takes a `Page` and builds every locator the class
  exposes, once, up front — no locator is (re)built inside a method.
- Methods named after what a user would *do* ("`sendMessage`,"
  "`searchFor`"), not how Playwright does it.
- **No assertions.** `SearchPage` never calls `expect(...)` — that stays in
  the test, which is where the actual expectation belongs. A page object
  describes the screen; the test decides what "correct" looks like.

## Page objects + fixtures

Lesson 6's `test.extend()` and a page object are a natural pair: a fixture
is a good place to construct a page object (and, if the screen needs it,
navigate to it) once, then hand the ready-to-use instance to every test that
asks for it. That's what `demo.spec.ts`'s `chatPage` and `searchPage`
fixtures do — no test constructs `new ChatPage(page)` itself.

## A real example in this repo

This app's own end-to-end suite already uses POM: see `e2e/pages/` —
`chatPage.ts`, `searchPage.ts`, `appLayoutPage.ts`, and a `pageManager.ts`
that bundles them behind `pageManager.onChatPage()`-style accessors, an
alternative to fixtures for wiring page objects into tests. Worth a look —
and worth noticing, too, that its page-object files were written in
noticeably different styles from each other (semicolons or not, a private
vs. a public `page` field, different locator strategies for the same kind of
element). POM gives you a *place* to put structure; it doesn't enforce
consistency by itself — that still takes a convention someone writes down
(or a linter).

## The screens for this lesson: Chat & Search

Same locators as Lessons 1, 2, and 4 — nothing new there. What's new is that
`ChatPage.sendMessage()` and `SearchPage.searchFor()` now hide them.

## Now

1. Read and run `demo.spec.ts`, alongside `pages/ChatPage.ts` and
   `pages/SearchPage.ts` — see how the fixtures from Lesson 6 construct and
   hand over each page object.
2. Open `homework.spec.ts` and `pages/HistoryPage.ts`. Finish the page
   object per its TODO comments, then complete the test — same Chat →
   History flow as Lesson 3's homework, now organized as page objects.
