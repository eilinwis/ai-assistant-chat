import { test } from '@playwright/test'

/**
 * Homework 5 — Custom widgets & complex interactions
 *
 * Screen under test: Playground ("/playground") — the Calendar, Modal,
 * Filter, and Gallery widgets (demo.spec.ts covered drag-and-drop, the
 * slider, the gallery's basic toggle, the video player, and the modal's
 * three ways of closing).
 *
 * Complete the exercise below. It's split into three tests — write each
 * one, deleting its `test.fixme()` line once it passes.
 */
test.describe('Homework 5: Custom widgets & complex interactions', () => {
  /**
   * Test 1 — Calendar & Modal
   *   1. Go to "/playground" and assert the calendar section
   *      (data-testid="playground-section-calendar") is visible.
   *   2. Assert the heading (data-testid="calendar-heading") matches the
   *      pattern /^[A-Za-z]+ \d{4}$/ (e.g. "August 2026") — don't hardcode a
   *      specific month, since "today" changes. Save its text.
   *   3. Click data-testid="calendar-next" twice, then assert the heading's
   *      text no longer equals what you saved in step 2.
   *   4. Find the first day button in the grid with
   *      `page.locator('[data-testid^="calendar-day-"]').first()`, read its
   *      own `data-testid` attribute (`getAttribute`), and strip the
   *      "calendar-day-" prefix to get the ISO date it represents.
   *   5. Click that day button, then assert
   *      data-testid="calendar-selected-date" reads exactly
   *      `Selected: <the ISO date from step 4>`.
   *   6. Open the modal (data-testid="modal-open-button"), assert the dialog
   *      (data-testid="modal-dialog") is visible, then click
   *      data-testid="modal-confirm-button".
   *   7. Assert the dialog is no longer visible, and that
   *      data-testid="modal-result" reads "Last action: confirmed".
   */
  test('navigating and selecting a date in the calendar, then confirming the modal', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 2 — Filter
   *   1. Go to "/playground" and assert the filter section
   *      (data-testid="playground-section-filter") is visible.
   *   2. Click the "frontend" category toggle
   *      (data-testid="filter-category-frontend") and assert its
   *      `aria-pressed` attribute becomes "true".
   *   3. Assert the results list (`li` elements inside
   *      data-testid="filter-results-list") has a count of 2, and that both
   *      data-testid="filter-result-p1" and data-testid="filter-result-p5"
   *      are visible (there are two frontend items among the five seeded
   *      playground items).
   *   4. Type "board" into data-testid="filter-search-input" (on top of the
   *      active category filter) and assert the results count drops to 1.
   *   5. Replace the search text with something that matches nothing (e.g.
   *      "zzz-nope") and assert data-testid="filter-empty-state" is visible
   *      and the results count is 0.
   *   6. Clear the search box, then click the "frontend" toggle again to
   *      turn it off — assert its `aria-pressed` is back to "false" and the
   *      results count is 5 (all seeded items, no filters active).
   */
  test('combining a category toggle with a search query narrows and resets the results', async () => {
    test.fixme()

    // Write your code here
  })

  /**
   * Test 3 — Calendar navigation & Gallery cycling
   *   1. Go to "/playground". Save the calendar heading's text
   *      (data-testid="calendar-heading").
   *   2. Click data-testid="calendar-next", then data-testid="calendar-prev"
   *      — assert the heading is back to the exact text you saved in step 1
   *      (prev/next should be exact inverses of each other).
   *   3. Compute today's ISO date yourself (`YYYY-MM-DD`, zero-padded) from
   *      `new Date()`, and locate that day's cell:
   *      `page.getByTestId(`calendar-day-${iso}`)`. Assert it has the class
   *      `widget-calendar__day--today` (`toHaveClass` accepts a substring
   *      via a regex, e.g. `/widget-calendar__day--today/`, so you don't
   *      need to match the whole class list).
   *   4. In the gallery, click through all four thumbnails in order — hero,
   *      logo, react, vite (data-testid="gallery-thumb-<id>") — and after
   *      each click assert that specific thumbnail's `aria-pressed` is
   *      "true".
   *   5. Click the vite thumbnail a second time (it's already active) and
   *      assert nothing changes: `aria-pressed` is still "true" and
   *      data-testid="gallery-main-image" still has `alt="Vite logo"`.
   */
  test('prev/next cancel out, today is marked in the grid, and clicking the active thumbnail again is a no-op', async () => {
    test.fixme()

    // Write your code here
  })
})
