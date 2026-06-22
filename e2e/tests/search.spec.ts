import { expect, test } from 'playwright/test';
import { PageManager } from '../pages/pageManager';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
});

const SEARCHED_MESSAGE = 'Wow, this looks amazing!'
const SEARCHED_REPLY = 'White lemmings do not exist in the modern digital era'

test.describe('Search', () => {
    test('Should be able to find a message', async ({ page }) => {
    const pageManager = new PageManager(page)
    await pageManager.onChatPage().fillChatInput(SEARCHED_MESSAGE);
    await pageManager.onChatPage().sendMessage();
    await pageManager.onAppLayout().goToSearchPage()
    await pageManager.onSearchPage().fillSearchInput(SEARCHED_MESSAGE)
    await pageManager.onSearchPage().expectSearchHeaderVisible()
    await pageManager.onSearchPage().expectSearchResultsVisible()
    const headerText = await pageManager.onSearchPage().getHeaderText()
    expect(headerText).toContain('Search in chats')
    const firstSearchResultText = await pageManager.onSearchPage().getFirstSearchResultText()
    expect(firstSearchResultText).toContain(SEARCHED_MESSAGE)
    const firstSearchResultReplyText = await pageManager.onSearchPage().getFirstSearchResultReplyText()
    expect(firstSearchResultReplyText).toContain(SEARCHED_REPLY)
})
})