import { test, expect, type Page } from '@playwright/test'

// Screen under test: Search ("/search").
// Setup happens on the Chat screen ("/") — Funny mode needs no backend.

async function sendChatMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  const sendButton = page.getByTestId('send-button')

  // Wait on the input, not the button — the button is also disabled
  // whenever it's empty, which isn't the condition we're waiting for here.
  await expect(chatInput).toBeEnabled({ timeout: 15_000 })
  await chatInput.fill(text)
  await sendButton.click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test.describe('Lesson 2: Locators & actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await sendChatMessage(page, 'Bananas are great')
    await sendChatMessage(page, 'Historians unite')
    await sendChatMessage(page, 'Ostriches assemble')

    await page.getByTestId('nav-tab-search').click()
    await expect(page).toHaveURL(/\/search$/)
  })

  test('searching narrows results, and filter() picks a specific one', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Type words from a message…')
    await searchInput.fill('a') // matches all three exchanges above

    const results = page.locator('li.search-results__item')
    await expect(results).toHaveCount(3)

    const bananaResult = results.filter({ hasText: 'Bananas' })
    await expect(bananaResult).toHaveCount(1)

    const texts = bananaResult.locator('.history-exchange__text')
    await expect(texts.first()).toHaveText('Bananas are great')
    await expect(texts.last()).toHaveText(
      'Bananas are just shy yellow kayaks that never learned to swim.',
    )
  })

  test('searching for text that was never sent shows no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Type words from a message…')
    await searchInput.fill('spaceships')

    await expect(page.getByText('No matches for your search.')).toBeVisible()
    await expect(page.locator('li.search-results__item')).toHaveCount(0)
  })
})
