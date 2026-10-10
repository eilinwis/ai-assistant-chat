# Playwright Chat Lab

**The Playwright practice app that fights back.**

Real-world UI chaos on demand — reproducible by seed, scored by Flake Score.

![CI](https://github.com/eilinwis/playwright-chat-lab/actions/workflows/ci.yml/badge.svg)
![e2e](https://github.com/eilinwis/playwright-chat-lab/actions/workflows/e2e.yml/badge.svg)
![GitHub Repo stars](https://img.shields.io/github/stars/eilinwis/playwright-chat-lab?style=flat-square&color=ffa500)
![GitHub Repo contributors](https://img.shields.io/github/contributors/eilinwis/playwright-chat-lab?style=flat-square&color=ffa500)
![GitHub Repo forks](https://img.shields.io/github/forks/eilinwis/playwright-chat-lab?style=flat-square&color=ffa500)
![GitHub Repo commits](https://badgen.net/github/commits/eilinwis/playwright-chat-lab/main?color=purple)



Chat Lab is a real app that turns chaotic when you ask it to:

- **Real-world  behaviour, combinable** - cookie walls, flaky network, iframes - 15 flags, on one at a time or all at once.
- **Reproducible by seed** — ten different combinations of challenges from real world applications.
- **Flake Score** — runs your hard mode tests across all 10 seeds and tells how sustainable your tests are.

![Turning on Hard Mode: iframe widgets, a tip over the Send button and a promo modal take over the chat](src/assets/hard_mode_demo.gif)

## Hard Mode

You know the feeling. The suite is green locally and on CI, and then one random
Tuesday it isn't. A cookie banner landed in front of a button, the API took four
seconds instead of one, someone removed a `data-testid`. Your tests weren't
wrong — the app just stopped being polite.

Flip "Hard mode" in the top-left corner and the same chat starts throwing that
kind of trouble at you:

- popups that block the page, and a promo that keeps coming back;
- slow replies, messages that fail until you retry, a rate limit that makes you
  wait;
- a DOM that won't sit still — no test ids, lists that re-mount, shuffled
  search results, forms inside iframes and shadow roots;
- browser quirks — files, a second tab, the clipboard, clock-dependent
  timestamps.

Passing once proves little. Flake Score runs your Hard Mode tests on ten
variations of that trouble (seeds 1–10), twice each, and tells you how many came
out clean — and for the rest, whether it's a failure you can replay, a timing
race, or a test that isn't ready for these flags yet.

```bash
npm run flake-score
```

Details: [src/HARD_MODE.md](src/HARD_MODE.md).

## Learn Playwright on it

An 11-lesson course (`[lessons/](lessons/README.md)`) uses this app as the
system under test, from the anatomy of a test through locators, fixtures, the
Page Object Model, network mocking and debugging to CI and parallelism. Each
lesson pairs an explanation with a working demo and a homework exercise;
homework is submitted as a pull request and checked by CI.

The course runs the app in its normal mode. Hard Mode is the next step once
your tests pass.

## The app

A small React/TypeScript chat with five screens — Chat, Search, Message
history, Playground and Help. It runs fully offline: "Funny mode" answers with
canned, deterministic replies, so the app and every test work without a
backend. History is kept in `localStorage`.

## Getting started

```bash
npm install
npx playwright install chromium

npm run dev     # the app on http://localhost:5173
npm run lint
npm run build
npm test        # unit tests
```



## Testing

```bash
npm run test:e2e        # e2e/ — the app's own suite and the hard mode suite
npm run test:lessons    # lessons/ — the course

# one file or folder
npm run test:e2e -- e2e/tests/chat.spec.ts
npm run test:lessons -- lessons/01-getting-started

npm run flake-score     # hard mode tests on all 10 seeds

npx playwright show-report
```

`ci.yml` runs lint, unit tests and the build on every push and PR to `main`.
For homework, comment `e2e <path/to/spec.ts>` on your PR to run just that file

## Contributing

All kinds of contributions are welcome. For homework, see
[Submitting homework](lessons/README.md#submitting-homework).

## License

Playwright Chat Lab is open-source software licensed under the [MIT License](LICENSE).