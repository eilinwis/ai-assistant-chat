import { Locator, Page } from "playwright";
import { expect } from "playwright/test";

export class SearchPage {
    private page: Page;
    readonly searchInput: Locator
    readonly searchHeader: Locator
    readonly firstSearchResultMessage: Locator
    readonly firstSearchResultReply: Locator

    constructor(page: Page) {
        this.page = page;
        this.searchInput = this.page.locator('input[type="search"]');
        this.searchHeader = this.page.locator('h2[class="panel__heading"]')
        this.firstSearchResultMessage = this.page.locator('li[class="search-results__item"]')
        .first()
        .locator('div[class="history-exchange__text"]').first();
        this.firstSearchResultReply = this.page.locator('li[class="search-results__item"]')
        .first()
        .locator('div[class="history-exchange__text"]').nth(1);
    }

    async fillSearchInput(query: string) {
        await this.searchInput.fill(query);
    }

    async expectSearchHeaderVisible() {
        await expect(this.searchHeader).toBeVisible();
    }

    async getHeaderText() {
        return await this.searchHeader.textContent();
    }

    async expectSearchResultsVisible() {
        await expect(this.firstSearchResultMessage).toBeVisible();
    }

    async getFirstSearchResultText() {
        return await this.firstSearchResultMessage.textContent();
    }

    async getFirstSearchResultReplyText() {
        return await this.firstSearchResultReply.textContent();
    }

}