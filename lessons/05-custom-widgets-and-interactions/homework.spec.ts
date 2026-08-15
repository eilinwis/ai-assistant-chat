import { test } from '@playwright/test'

/**
 * Homework 5 — Custom widgets & complex interactions
 *
 * Screen under test: Playground ("/playground") — the Calendar, Modal, and
 * Filter widgets (demo.spec.ts covered drag-and-drop, the slider, the
 * gallery, the video player, and the modal's two "cancel" paths).
 *
 * Complete the exercise below. It's split into two tests — write each one,
 * deleting its `test.fixme()` line once it passes.
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
})
