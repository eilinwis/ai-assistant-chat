# Playwright Testing Course

11 lessons, "what is Playwright" to CI-ready end-to-end tests, using this
repo's own chat app as the system under test.

## Setup

```bash
npm install
npx playwright install chromium
```

No need to start the dev server yourself — `lessons/playwright.config.ts`
does it for you.

Note: non-funny-mode replies and **Reset Chat** need a real backend, which
this repo doesn't include — that's the point of Lesson 9 (mocking the API
instead of running a server). Everything before that runs on "Funny mode"
alone.

## Each lesson

- `README.md` — theory
- `demo.spec.ts` — a working example, run it and experiment
- `homework.spec.ts` — an exercise gated by `test.fixme()`; delete that line
  once your test passes

```bash
# one file
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/demo.spec.ts

# a whole lesson
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started

# everything
npx playwright test --config=lessons/playwright.config.ts
```

Useful flags: `--ui`, `--debug`, `--headed`/`--headless`. Report after a
run: `npx playwright show-report`.

## Submitting homework

1. Branch off `main`: `git checkout -b <your-name>/lesson-<NN>`.
2. Solve the lesson's `homework.spec.ts` and delete its `test.fixme()`.
3. Run it locally until it passes.
4. Commit and push the branch.
5. Open a PR with <[homework] lesson <NN>> .
6. Comment on the PR: `e2e lessons/<lesson-folder>/homework.spec.ts` — CI
   runs just that file and reports back as a check on the PR.
