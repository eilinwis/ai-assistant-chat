import { type Page } from '@playwright/test'

/**
 * TODO (Homework 7): finish this page object for the Message history screen
 * ("/history" — the same screen Lesson 3 used).
 *
 *   1. Add `import type { Locator } from '@playwright/test'` above (or fold
 *      it into the existing import).
 *   2. Declare two more readonly fields, next to `page`:
 *        - `deleteButton: Locator`
 *        - `historyItems: Locator`
 *   3. In the constructor, assign them:
 *        - deleteButton -> page.getByTestId('delete-history-button')
 *        - historyItems -> page.locator('li.history-day__item')
 *   4. Add an `async goto()` method that clicks
 *      `page.getByTestId('nav-tab-history')`.
 *
 * See pages/ChatPage.ts and pages/SearchPage.ts for the shape to follow.
 */
export class HistoryPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }
}
