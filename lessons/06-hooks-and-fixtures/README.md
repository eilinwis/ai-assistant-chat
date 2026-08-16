# Lesson 6 — Test Organization: Hooks & Fixtures

## Recap

Lessons 2 and 3 both defined the same little helper —
`sendChatMessage(page, text)` — and called it manually at the top of every
test. That works, but it's easy to forget, easy to drift out of sync across
files, and it says nothing about *when* it runs relative to the rest of the
test. This lesson replaces copy-pasted setup with two things Playwright
builds in for exactly this: hooks and fixtures.

## `test.describe` and `beforeEach`/`afterEach`

You've used `test.describe` since Lesson 1 just to group tests. It also
scopes hooks:

- `test.beforeEach(fn)` runs `fn` before every test in its `describe` block
  (or the whole file, if declared outside any `describe`).
- `test.afterEach(fn)` runs after every test, **whether it passed or
  failed** — the one place you can reliably do "no matter what happened,
  also do this."

`describe` blocks can nest, and so can their hooks. An inner `beforeEach`
runs *after* the outer one (setup goes outside-in); an inner `afterEach`
would run *before* the outer one (teardown goes inside-out, the reverse
order). The demo's `with two messages already sent` block relies on this:
its `beforeEach` assumes the outer `beforeEach` already navigated to `/`.

Both hooks — like every test — receive a second argument, `testInfo`, with
details about the current test: its title, and (in `afterEach`) whether it
passed. That's what makes "only take a screenshot if the test failed" (see
the demo) possible.

## Fixtures

A **fixture** is Playwright's other tool for shared setup/teardown — `page`
itself is one, built in. `test.extend()` lets you add your own:

```ts
const test = base.extend<{ myFixture: SomeType }>({
  myFixture: async ({ page }, use) => {
    // setup — runs once, right before the fixture is first needed
    await use(theValue) // hands control (and a value) to the test
    // teardown — runs after the test finishes, pass or fail
  },
})
```

A fixture's setup only runs if some test (or hook) in the file actually asks
for it, by name, in its argument list — Playwright resolves the dependency
graph and sets fixtures up lazily. `{ auto: true }` — see the demo's
`failOnPageErrors` — opts out of that laziness: an auto fixture runs for
*every* test in the file, whether anything asks for it or not. That's the
right shape for a fixture that exists purely for a side effect (or a
teardown assertion), not for a value any test needs to read.

**Hook or fixture?** Roughly: reach for a `beforeEach` when the setup is
just "do these steps first," and reach for a fixture when other tests in
other files might want the *same* setup — a fixture is a definition you
import and extend `test` with, while a hook only exists inside the
`describe` block it's written in.

## The screens for this lesson: Chat & Message history

Same screens and locators as Lessons 1–3
(`chat-input`/`send-button`/`message-assistant`/`message-user`,
`nav-tab-history`/`li.history-day__item`/`delete-history-button`,
`nav-tab-search`/`getByPlaceholder('Type words from a message…')`/
`li.search-results__item`) — nothing new there. What's new is *how* the
tests reach that state.

## Now

1. Read and run `demo.spec.ts` — it covers a custom `sendMessage` fixture,
   an `{ auto: true }` fixture, `beforeEach`/`afterEach`, and nested
   `describe` blocks composing their hooks.
2. Open `homework.spec.ts` and complete both exercises described there — the
   same Chat → Search flow as Lesson 2's homework, now organized with a
   fixture you write yourself.
