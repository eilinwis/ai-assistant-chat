# Lesson 10 — Debugging & Visual Tools

## Recap

Every test so far has produced a pass/fail and, on failure, an error
message. That's often not enough to figure out *why* — especially for a
failure you can't reproduce locally, or one buried in a CI run you weren't
watching live. This lesson is about the evidence Playwright can capture
alongside a test, so a failure comes with a recording of what actually
happened.

## The trace viewer

A trace is a timeline of everything Playwright did — every action, every
network request, a screenshot before and after each step, even a DOM
snapshot you can inspect like DevTools. `lessons/playwright.config.ts`
already sets `trace: 'on-first-retry'`, so a flaky test that fails once and
passes on retry gets one automatically.

You can also capture one by hand, around just the part of a test you care
about: `context.tracing.start({ screenshots: true, snapshots: true })` …
`context.tracing.stop({ path })` — that's what the demo does. Open the
result with:

```bash
npx playwright show-trace test-results/.../trace.zip
```

## Screenshots

`page.screenshot({ path })` captures the whole page; a locator's own
`.screenshot({ path })` crops to just that element — useful when only one
widget's appearance is what you're checking, not the full page around it.
(Playwright also has `expect(locator).toHaveScreenshot()` for pixel-diffing
against a saved baseline — a different, larger topic: visual regression
testing, with its own baseline-management workflow. Out of scope here; this
lesson only covers taking a screenshot as *evidence*, not comparing one.)

## Video

Unlike tracing, video can't be turned on mid-test — it's set when a context
is created: `browser.newContext({ recordVideo: { dir } })`. The recording
only finishes encoding once that context closes, so `page.video()?.path()`
has to be read *after* `context.close()`, not before. (You can also turn
video on for every test in a run via `use: { video: 'on' }` in the config —
the per-context approach the demo uses is how you'd record just one
specific test instead.)

## `codegen` — recording actions into code

`npx playwright codegen http://localhost:5173` opens a real browser next to
an inspector window: click and type in the browser, and Playwright writes
the equivalent code live. It's not something a test asserts on — it's a
workflow tool, most useful for two things: getting a locator you're not
sure how to target by hand, or a first draft of a new test to edit down
afterward. Try it against this app's own Chat screen.

## Iframes and shadow DOM — for reference

This app doesn't use either, so there's nothing here to run a live demo
against — but both come up often enough elsewhere to be worth knowing:

- **Iframes**: `page.frameLocator('iframe[title="..."]').getByRole(...)` —
  a `FrameLocator` scopes every query inside it to that frame's document,
  the same locator API you already know, just rooted somewhere other than
  the top-level page.
- **Shadow DOM**: nothing special needed. Playwright's locators pierce open
  shadow roots automatically — `page.getByTestId(...)` (or any other
  locator) finds elements inside a shadow tree the same way it finds
  anything else, with no extra API to learn.

## The screens for this lesson: Chat, Search & Playground

`demo.spec.ts` reuses Chat's `chat-input`/`send-button`/`message-assistant`
locators (Lessons 1 and 4). The homework adds Search's flow (Lesson 2) for
the trace exercise, and the Playground gallery (Lesson 5) for the
screenshot exercise — nothing new to learn about the screens themselves.

## Now

1. Read and run `demo.spec.ts` — three tests, each capturing a different
   kind of evidence (trace, screenshots, video). After running it, open one
   of the generated files: `npx playwright show-trace` on the trace, or
   just look at the PNGs/`.webm` under `test-results/`.
2. Open `homework.spec.ts` and complete both exercises described there —
   tracing a multi-screen flow, and screenshotting one Playground widget.
