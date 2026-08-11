# Lesson 2 — Locators & Actions

## Recap

In Lesson 1 you used `page.getByRole(...)` and `page.getByTestId(...)` to
find elements, and `.fill()`/`.click()` to act on them. This lesson goes
deeper on both: how to reliably find *any* element (a locator), and how to
chain and filter locators to find exactly the one you want.

## Locators

A **locator** describes how to find an element, but doesn't find it
immediately — it's lazy. Nothing is queried until you call an action or
assertion on it. Every time you do, Playwright re-queries the DOM and waits
for the element to be "actionable" (visible, stable, not covered by another
element, etc.) before proceeding. This is what makes Playwright tests
resistant to timing issues — you almost never need a manual `sleep`.

Playwright recommends locating elements the way a user (or assistive
technology) would, roughly in this order of preference:

- `page.getByRole('button', { name: 'Send' })` — by ARIA role + accessible
  name. Works for buttons, links, checkboxes, headings, etc.
- `page.getByText('No matches for your search.')` — by visible text.
- `page.getByPlaceholder('Type words from a message…')` — by placeholder text.
- `page.getByTestId('message-assistant')` — by a `data-testid` attribute,
  when the app exposes one and none of the above fit well.
- A scoped CSS locator, e.g. `page.locator('li.search-results__item')` — a
  pragmatic fallback when an element has no role, text, or test id of its
  own to key off of. Prefer it over deep, brittle selectors
  (`div > div:nth-child(3) > span`), and keep it as narrow as possible.

### Chaining and filtering

Locators can be narrowed down:

```ts
// scope a search to inside another locator
page.getByTestId('message-assistant').locator('.chat-message__bubble')

// filter a list of matches by text they contain
page.locator('li.search-results__item').filter({ hasText: 'Bananas' })

// pick one match out of several
page.getByTestId('message-assistant').first()
page.getByTestId('message-assistant').last()
page.getByTestId('message-assistant').nth(1)
```

## Actions

- `.click()` — click. Auto-waits and auto-scrolls into view first.
- `.fill(text)` — clear a field and type text into it in one step.
- `.press(key)` — press a single key, e.g. `.press('Enter')`.

## A gotcha: assertions retry, plain reads don't

`expect(locator).toHaveText(...)` retries until it matches (or times out).
But `await locator.textContent()` reads **once**, immediately — if the page
hasn't finished re-rendering yet (e.g. right after a client-side navigation),
you can read stale content. Prefer `expect(...)` assertions over manual
`textContent()`/`isVisible()` checks whenever you're about to make a
decision based on the result — this app's own client-side routing is fast
enough that a raw read right after `page.goto`/`click` can occasionally
catch the *previous* screen's content.

## The screen for this lesson: Search in chats

Route: `/search`, reached by clicking the `nav-tab-search` tab. It searches
your **local chat history** (from this browser session) for text in either
the message or the reply, and needs at least one exchange to exist before
you navigate there — so both files start by sending a couple of chat
messages first, then move to Search to do the actual locator work.

- Search input: `page.getByPlaceholder('Type words from a message…')`
- Each result: `<li class="search-results__item">`, containing two
  `.history-exchange__text` divs — the first is your message, the second is
  the assistant's reply.
- No matches: `page.getByText('No matches for your search.')`
- Empty query: `page.getByText('Enter text to search your local history.')`

## Now

1. Read and run `demo.spec.ts`.
2. Open `homework.spec.ts` and complete the exercise described there — same
   screen (Search), a different scenario.
