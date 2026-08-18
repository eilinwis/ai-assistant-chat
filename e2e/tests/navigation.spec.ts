import { test } from '@playwright/test'
import { PageManager } from '../pages/pageManager'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173')
})

test.describe('Navigation', () => {
  test('shows Chat, Search, Message history, and Help tabs on initial load', async ({
    page,
  }) => {
    const pageManager = new PageManager(page)
    await pageManager.onAppLayout().expectMainNavigationTabsVisible()
  })
})
