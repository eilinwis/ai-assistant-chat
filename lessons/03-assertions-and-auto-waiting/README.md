# Lesson 3 — Assertions & Auto-Waiting Deep Dive

## Recap

You've used `toBeVisible()` and `toHaveText()` since Lesson 1. This lesson
looks at the fuller set of "web-first" assertions, what "retry-ability"
actually means under the hood, and a tool for checking several independent
things in one test without stopping at the first failure.

## Web-first assertions

Every assertion below **polls**: Playwright re-checks the condition
repeatedly (a few times a second) until it's true or the timeout is
reached — it does not just check once. That's why you rarely need
`page.waitForTimeout(...)` in Playwright tests: the assertion itself is the
wait.

- `toBeVisible()` / `toBeHidden()` — element is (or isn't) visible.
- `toBeEnabled()` / `toBeDisabled()` — element's disabled state.
- `toHaveText(expected)` — exact text match (after whitespace
  normalization — see below). Accepts a string, a regex, or an array
  (matched against a list of elements).
- `toHaveCount(n)` — a locator matching multiple elements resolves to
  exactly `n` of them right now.
- `toHaveValue(expected)` — an `<input>`/`<textarea>`'s current value.

### Whitespace normalization

`toHaveText()` collapses runs of whitespace — including newlines — into
single spaces before comparing. A three-line textarea value and its
single-line equivalent are treated as equal:

```ts
await expect(el).toHaveText('Line one\nLine two')  // passes
await expect(el).toHaveText('Line one Line two')   // also passes
```

Good to know before you go hunting for why an assertion "shouldn't" have
passed.

### Retry-ability vs. reading once

Compare:

```ts
await expect(locator).toHaveText('Message history')     // retries
const text = await locator.textContent(); expect(text).toBe('Message history') // reads once
```

The first waits for the DOM to catch up to a re-render (e.g. right after a
client-side navigation). The second reads whatever is there *right now* —
if the new screen hasn't finished rendering, you can read stale content.
This bit us for real while building this course (see Lesson 2's README) —
prefer the first form whenever the result decides whether your test passes.

## Soft assertions

A normal failed `expect(...)` throws immediately and stops the test. A
**soft** assertion (`expect.soft(...)`) records the failure but lets the
test keep running, so you can see *every* problem from one run instead of
fixing them one at a time. The test still ends up failed overall if any
soft assertion failed — you don't need to do anything extra to make that
happen.

```ts
expect.soft(a).toBe(1)
expect.soft(b).toBe(2)
// both run even if the first one fails; the test fails at the end if either did
```

Use it for checks that are logically independent of each other (e.g.
"every one of these five things is present"), not for a sequence of steps
where a failure early on makes the later ones meaningless.

## The screen for this lesson: Message history

Route: `/history`. Like Search (Lesson 2), it reads your local chat history,
grouped by day:

- Heading: `Message history` (`h2.panel__heading`)
- Empty state: `page.getByText('No history yet. Send a message in Chat to build your archive.')`
- Delete button: `page.getByTestId('delete-history-button')` — disabled
  whenever there's no history yet, enabled once there is at least one
  exchange. We only check this button's state in this lesson; clicking it
  opens a native `confirm()` dialog, which needs a technique we haven't
  covered yet (that's Lesson 7).
- Each entry: `<li class="history-day__item">`, with the same
  `.history-exchange__text` structure you saw on the Search screen (message,
  then reply) and a day heading `.history-day__title` (e.g. "Tuesday, August
  11, 2026" — formatted from today's date, so match it with a regex, not a
  hardcoded string).

## Now

1. Read and run `demo.spec.ts`.
2. Open `homework.spec.ts` and complete the exercise described there — same
   screen (Message history), a different scenario.
