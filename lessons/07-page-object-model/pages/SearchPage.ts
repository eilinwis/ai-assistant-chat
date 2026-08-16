import type { Locator, Page } from '@playwright/test'

/**
 * A page object for the Search screen ("/search"). Notice there's no
 * `expect(...)` anywhere in here — assertions stay in the test, which is
 * what reads the actual expectation. This class only exposes what the
 * screen has and what you can do to it.
 */
export class SearchPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly results: Locator
  readonly noMatchesText: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder('Type words from a message…')
    this.results = page.locator('li.search-results__item')
    this.noMatchesText = page.getByText('No matches for your search.')
  }

  async goto() {
    await this.page.getByTestId('nav-tab-search').click()
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query)
  }
}
