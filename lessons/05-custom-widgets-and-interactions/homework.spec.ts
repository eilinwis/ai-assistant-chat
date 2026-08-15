import { test } from '@playwright/test'

/**
 * Homework 5 — Custom widgets & complex interactions
 *
 * Screen under test: Playground ("/playground") — the Calendar and Modal
 * widgets this time (demo.spec.ts covered drag-and-drop, the slider, and
 * the gallery).
 *
 * Complete the test below:
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
 *
 * Delete the `test.fixme()` line once your test is complete and passing.
 */
test.describe('Homework 5: Custom widgets & complex interactions', () => {
  test('navigating and selecting a date in the calendar, then confirming the modal', async () => {
    test.fixme()

    // Write your code here
  })
})
