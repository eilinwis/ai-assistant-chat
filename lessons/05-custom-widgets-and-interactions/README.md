# Lesson 5 — Custom Widgets & Complex Interactions

## Recap

Lessons 1–4 all worked with plain HTML controls: text inputs, a checkbox, and
buttons. This lesson meets a screen built from hand-rolled widgets — drag and
drop, a range slider, toggle buttons — that don't behave like a `<form>`, and
need a slightly different toolkit.

## Drag and drop

`locator.dragTo(target)` picks up the source locator and drops it onto the
target locator, firing the real `dragstart` / `dragover` / `drop` events a
browser would — this app's drag-and-drop widget listens for exactly those,
so `dragTo()` exercises it properly (a raw mouse-move simulation wouldn't).

A locator is a *query*, not a snapshot — it re-runs against the live DOM
every time you use it. In the demo, `apple` is captured once, before the
drag; after the drag removes that element from the source list entirely
(rather than moving it), asserting `toHaveCount(0)` on that same locator
still works, because it re-queries rather than remembering what it found the
first time.

## Range inputs

`<input type="range">` doesn't take typed text, so `.fill(value)` behaves
differently here: it sets the value directly (no keyboard events). To
exercise the browser's *own* keyboard handling for a slider — the way a real
user tabbing through the page would move it — focus it and press arrow keys:
`ArrowLeft`/`ArrowRight` (or `ArrowDown`/`ArrowUp`) step the value by the
input's `step`. Two different code paths in the app can end up setting the
same value; test the one you actually care about.

## Toggle state via `aria-pressed`

Buttons that act like toggles (a selected thumbnail, an active filter, a
video's play/mute controls) often expose their state through the
`aria-pressed` attribute rather than through visible text alone — it's also
what makes them accessible to screen readers.
`expect(locator).toHaveAttribute('aria-pressed', 'true' | 'false')` asserts
on it directly, and is more precise than inferring state from a CSS class or
from button text that might get restyled.

## The same outcome, reached different ways

The modal in this app closes — and records the same "cancelled" result —
whether you click its Cancel button *or* click the backdrop behind it. Only
a click that actually lands outside the dialog (the dialog stops the event
from bubbling to the backdrop) counts; `locator.click({ position })` lets
you target a specific point inside an element's box, which is how the demo
aims a click at the backdrop's corner instead of wherever the dialog happens
to be centered.

## The screen for this lesson: Playground

Route: `/playground`. Several independent widgets, each in its own
`data-testid="playground-section-*"` block:

- Drag and drop: source items `dnd-item-<id>` (`apple`/`banana`/`cherry`),
  dropzone `dnd-dropzone`, dropped items `dnd-dropped-<id>`, reset button
  `dnd-reset` (disabled once nothing's been dropped).
- Volume slider: `volume-slider` (the range input), `volume-reset`.
- Image gallery: main image `gallery-main-image`, caption `gallery-caption`,
  thumbnails `gallery-thumb-<id>` (`hero`/`logo`/`react`/`vite`).
- Calendar: heading `calendar-heading`, nav buttons `calendar-prev` /
  `calendar-next`, day cells `calendar-day-<iso-date>`, selection readout
  `calendar-selected-date`.
- Modal: open button `modal-open-button`, dialog `modal-dialog`, its
  backdrop `modal-backdrop`, `modal-cancel-button` / `modal-confirm-button`,
  and the outcome readout `modal-result`.
- Video player: `video-player`, `video-play-button` / `video-mute-button`
  (both toggle text and `aria-pressed`), and the `video-time` readout.
- Filter: search box `filter-search-input`, category toggles
  `filter-category-<category>`, results list `filter-results-list`
  (`filter-result-<id>` per item), and the `filter-empty-state` message.

## Now

1. Read and run `demo.spec.ts` — it covers drag-and-drop, the slider, the
   gallery's toggle state, the video player's controls, and two ways of
   dismissing the modal.
2. Open `homework.spec.ts` and complete both exercises described there —
   same screen (Playground), the Calendar, Modal, and Filter widgets this
   time.
