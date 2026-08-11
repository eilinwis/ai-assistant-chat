# Playwright Testing Course

A hands-on course for learning to write end-to-end tests with

## Prerequisites

From the project root:

```bash
npm install
npx playwright install chromium
```

You do **not** need to start the dev server yourself — `lessons/playwright.config.ts`
starts `npm run dev` for you automatically and reuses it if it's already running.

Note: this app also supports talking to a real backend for non-"funny mode"
replies and for **Reset Chat** (`POST /api/reset`). No backend is included in
this repo, so `Reset Chat` won't visibly do anything until Lesson 8, where we
mock that API instead of running a real server. Everything before that uses
"Funny mode" (on by default), which needs no backend at all.

## Running a lesson

Each lesson has a `demo.spec.ts` (working example) and a `homework.spec.ts`
(exercise, on the same screen as the demo). Run either one directly:

```bash
# run the demo for lesson 1
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/demo.spec.ts

# run the homework for lesson 1
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/homework.spec.ts

# run every test in a lesson folder
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started

# run everything in the course
npx playwright test --config=lessons/playwright.config.ts
```

Useful flags:

- `--ui` — open Playwright's UI mode (great for stepping through a test)
- `--debug` — open the Playwright inspector and pause on the first action
- `--headed` / `--headless` — force a browser window on or off (lessons run
  headed by default so you can watch the browser)

After a run, open the HTML report with:

```bash
npx playwright show-report
```

## How to work through a lesson

1. Read the lesson's `README.md`.
2. Run `demo.spec.ts` and watch it execute. Open it in your editor and change
   things — break it on purpose, then fix it — to build intuition.
3. Open `homework.spec.ts`. It contains a task description and a
   `test.fixme()` line. Write the test, then delete the `test.fixme()` line
   and re-run the file to confirm it passes.
