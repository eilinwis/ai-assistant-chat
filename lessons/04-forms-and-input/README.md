# Lesson 4 — Forms & User Input

## Recap

So far every message you've sent used `.fill()`, which sets a field's value
directly and instantly. This lesson looks at when that's not good enough,
plus checkboxes and disabled-based validation.

## `.fill()` vs. real keystrokes

`.fill(text)` sets an `<input>`/`<textarea>`'s value in one step. It's fast
and fine for "I just need this text in this field" — but it does **not**
fire the individual `keydown`/`keyup` events a real keystroke would. If the
app's behavior depends on *which key* was pressed (not just the final
value), `.fill()` won't trigger it.

This app's chat box is exactly that case — its `onKeyDown` handler submits
on Enter, but inserts a newline on Shift+Enter. To exercise that, type for
real:

- `locator.pressSequentially(text)` — types a string character by character,
  firing real keyboard events for each one (slower than `.fill()`, but
  necessary here).
- `locator.press(key)` — presses a single key or combo, e.g. `.press('Enter')`,
  `.press('Shift+Enter')`, `.press('Backspace')`.

## Checkboxes

- `.check()` / `.uncheck()` — set a checkbox to a specific state. Both are
  idempotent: calling `.check()` on an already-checked box does nothing and
  doesn't error.
- `expect(locator).toBeChecked()` / `.not.toBeChecked()` — assert the
  current state.

(This app doesn't have radio buttons, `<select>` dropdowns, or file
inputs — but for reference, Playwright covers those too: `.check()` also
works for radios, `.selectOption(value)` for selects, and
`.setInputFiles(path)` for `<input type="file">`.)

## Disabled state as validation

Not every form validates with an error message — sometimes the "you did it
wrong" feedback is just that the submit control stays disabled. The Send
button here is disabled whenever the field is empty *or contains only
whitespace* (it checks the trimmed value), regardless of whether the app
has finished loading. That's a second, independent thing that can disable
the same element — worth being precise about which condition you're
actually testing.

## The screen for this lesson: Chat

Same screen as Lesson 1 (`/`), revisited with a different toolset:

- Funny mode checkbox: `page.getByTestId('funny-mode-toggle')`
- Chat input: `page.getByTestId('chat-input')` (a `<textarea>`)
- Send button: `page.getByTestId('send-button')`

As before, wait for the chat input to be enabled before interacting with it
(see Lesson 1's README for why we wait on the input, not the button).

## Now

1. Read and run `demo.spec.ts`.
2. Open `homework.spec.ts` and complete the exercise described there — same
   screen (Chat), a different scenario.
