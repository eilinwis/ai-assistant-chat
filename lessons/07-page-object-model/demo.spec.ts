import { test as base, expect } from '@playwright/test'
import { ChatPage } from './pages/ChatPage'
import { SearchPage } from './pages/SearchPage'

// Screens under test: Chat ("/") and Search ("/search") — the same flow as
// Lesson 2's demo, refactored: raw `page.getByTestId(...)` calls become
// named locators and methods on page objects, injected here through the
// custom fixtures Lesson 6 introduced.

type Fixtures = {
  chatPage: ChatPage
  searchPage: SearchPage
}

const test = base.extend<Fixtures>({
  chatPage: async ({ page }, use) => {
    const chatPage = new ChatPage(page)
    await chatPage.goto()
    await use(chatPage)
  },

  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page))
  },
})

test.describe('Lesson 7: Page Object Model', () => {
  test('a page object bundles a screen\'s locators and actions in one place', async ({ chatPage }) => {
    await chatPage.sendMessage('Bananas are great')

    await expect(chatPage.lastUserMessage).toHaveText('Bananas are great')
  })

  test('two page objects, from two fixtures, cooperate in the same test', async ({ chatPage, searchPage, page }) => {
    await chatPage.sendMessage('Bananas are great')
    await chatPage.sendMessage('Historians unite')

    await searchPage.goto()
    await expect(page).toHaveURL(/\/search$/)

    await searchPage.searchFor('a') // matches both messages above
    await expect(searchPage.results).toHaveCount(2)
  })

  test('assertions stay in the test — page objects only expose state and actions', async ({
    chatPage,
    searchPage,
    page,
  }) => {
    await chatPage.sendMessage('Ostriches assemble')

    await searchPage.goto()
    await expect(page).toHaveURL(/\/search$/)
    await searchPage.searchFor('spaceships') // never sent

    await expect(searchPage.noMatchesText).toBeVisible()
    await expect(searchPage.results).toHaveCount(0)
  })
})
