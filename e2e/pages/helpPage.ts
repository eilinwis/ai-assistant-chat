import type { Locator, Page } from '@playwright/test'

export const HELP_SPOILER_ITEM_TEST_IDS = [
  'help-item-failed-ai-response',
  'help-item-blank-chat',
  'help-item-empty-history',
  'help-item-cannot-send',
  'help-item-reset-no-history',
] as const

export type HelpSpoilerItemTestId = (typeof HELP_SPOILER_ITEM_TEST_IDS)[number]

export class HelpPage {
  private readonly page: Page

  /** “Error: failed to get AI response” accordion */
  readonly failedAiSpoiler: Locator
  readonly failedAiTrigger: Locator
  readonly spoilerBody: Locator
  readonly details: Locator

  constructor(page: Page) {
    this.page = page

    this.failedAiSpoiler = page.getByTestId('help-item-failed-ai-response')
    this.failedAiTrigger = page.getByTestId('help-trigger-failed-ai-response')
    this.spoilerBody = page.locator('.help-spoiler__body').first();
    this.details = page.locator('details').first();
  }

  async openFailedAiResponseSpoiler(): Promise<void> {
    await this.failedAiTrigger.click()
  }
}
