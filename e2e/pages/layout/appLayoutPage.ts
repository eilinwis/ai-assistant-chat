import { expect, type Locator, type Page } from '@playwright/test'

export class AppLayoutPage {
  readonly page: Page
  readonly chatTab: Locator
  readonly searchTab: Locator
  readonly historyTab: Locator
  readonly helpTab: Locator

  constructor(page: Page) {
    this.page = page
    this.chatTab = page.getByTestId('nav-tab-chat')
    this.searchTab = page.getByTestId('nav-tab-search')
    this.historyTab = page.getByTestId('nav-tab-history')
    this.helpTab = page.getByTestId('nav-tab-help')
  }

  async expectMainNavigationTabsVisible(): Promise<void> {
    await expect(this.chatTab).toBeVisible()
    await expect(this.searchTab).toBeVisible()
    await expect(this.historyTab).toBeVisible()
    await expect(this.helpTab).toBeVisible()
  }

  async goToSearchPage() {
    await this.searchTab.click();
  }
  async goToChatPage() {
    await this.chatTab.click();
  }
  async goToHistoryPage() {
    await this.historyTab.click();
  }
  async goToHelpPage() {
    await this.helpTab.click();
  }
}
