# Lesson 1 — Getting Started: Anatomy of a Playwright Test

## What is Playwright?

Playwright is a framework for automating real browsers (Chromium, Firefox,
WebKit) from code. For testing, that means you can drive a page the same way
a user would — open a URL, click things, type into fields — and then make
assertions about what happened.

Every action and assertion is **asynchronous**: clicking a button, waiting
for a page to load, checking that text appeared — all of these take real
time in a real browser. That's why every Playwright call is awaited.

## The app under test

Throughout this course we test **this repository's own app** — the "AI
Assistant Chat" demo (`src/`), built specifically for practicing Playwright.
It's a small React chat UI with four screens: Chat, Search in chats, Message
history, and Help. `lessons/playwright.config.ts` starts it for you, so you
don't need a separate terminal running `npm run dev`.

This lesson works with the **Chat screen** (`/`, the homepage). Send a
message and the assistant replies — no backend required, because "Funny
mode" (a checkbox on the page, on by default) picks a canned reply locally
based on the first letter of your message. Try sending "Hello there!" — see
`src/data/funnyReplies.ts` if you want to know why.

## Anatomy of a test file

```ts
import { test, expect } from '@playwright/test'

test.describe('A group of related tests', () => {
  test('a single test case', async ({ page }) => {
    // ... actions and assertions go here
  })
})
```

- `test.describe(name, fn)` groups related tests together. It's optional but
  keeps output organized.
- `test(name, fn)` defines one test case. The callback receives a set of
  **fixtures** — for now, just `page`, which is a fresh browser tab/page.
- `expect(...)` makes an assertion. If it fails, the test fails and Playwright
  reports exactly what it expected vs. what it found.

## The building blocks used in this lesson

- `page.goto(url)` — navigate the page to a URL. Because our config sets a
  `baseURL`, `page.goto('/')` is enough — no need to type
  `http://localhost:5173` every time.
- `expect(page).toHaveTitle(stringOrRegex)` — assert the document title.
- `page.getByRole(role, { name })` — find an element by its accessibility
  role and accessible name, the same way a screen reader would.
- `page.getByTestId(id)` — find an element by its `data-testid` attribute.
  This app adds `data-testid`s to its key controls specifically to make them
  easy to target in tests (e.g. `chat-input`, `send-button`).
- `expect(locator).toBeVisible()` / `.toHaveText(...)` — assert an element is
  visible, or has exact text.
- `.fill(text)` / `.click()` — type into a field, click an element (more on
  actions in Lesson 2).

Notice that assertions like `toHaveTitle` and `toBeVisible` don't need a
manual wait, even though the page might still be loading. Playwright's
assertions **retry automatically** until they pass or time out — this is
called a "web-first assertion" and it's central to how Playwright avoids
flaky tests. We'll go deeper on this in Lesson 3.

One real quirk you'll see in the demo: right after the page loads, this app
is still trying (and, without a backend, failing) to fetch old chat history,
which briefly disables the chat input. Wait on the **input**, not the Send
button — the button has *two* separate reasons to be disabled (app still
loading, or the field is empty), and right before you `.fill()` it, it's
always empty, so checking the button first would wait forever. The input is
only gated by app-readiness, so:

```ts
await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
```

...is the reliable way to wait for "the app is ready to receive input." A
small, real example of why it pays to check *what condition* a disabled
state actually represents before you assert on it.

## Running tests

From the project root:

```bash
# run every test in this lesson
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started

# run just the demo, and watch the browser do it
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/demo.spec.ts

# step through it interactively
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/demo.spec.ts --ui
```

After running, you can open the HTML report Playwright generates:

```bash
npx playwright show-report
```

## Now

1. Read and run `demo.spec.ts`. Try changing the expected reply text to
   something wrong, and see what the failure output looks like.
2. Open `homework.spec.ts` and complete the exercise described there — same
   screen (Chat), a different scenario.
