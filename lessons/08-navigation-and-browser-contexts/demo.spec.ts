import { test, expect, type Page } from '@playwright/test'

// Screens under test: Chat ("/") to create history, then Message history
// ("/history") to observe it — the same screens Lessons 1 and 3 used. This
// lesson isn't about new screen behavior; it's about *where* a page lives:
// which tab, which browser context, and what storage it can see.

async function sendMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  const sendButton = page.getByTestId('send-button')
  await expect(chatInput).toBeEnabled({ timeout: 15_000 })
  await chatInput.fill(text)
  await sendButton.click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

test.describe('Lesson 8: Navigation & browser contexts', () => {
  test('a second tab in the same browser context sees the same local storage', async ({ page, context }) => {
    await page.goto('/')
    await sendMessage(page, 'Bananas are great')

    // context.newPage() opens another tab in the *same* browser context —
    // same cookies, same localStorage. It reads history fresh on load, so
    // it only sees the message because we sent it before opening this tab.
    const secondTab = await context.newPage()
    await secondTab.goto('/history')

    await expect(secondTab.locator('li.history-day__item')).toHaveCount(1)
    await expect(secondTab.locator('.history-exchange__text').first()).toHaveText(
      'Bananas are great',
    )

    await secondTab.close()
  })

  test('a separate browser context has its own, isolated storage', async ({ page, browser }) => {
    await page.goto('/')
    await sendMessage(page, 'Historians unite')

    // browser.newContext() is a different story: a brand-new context has no
    // cookies and no localStorage of its own — this app's own Help page
    // says as much ("Another browser, incognito mode... will not show the
    // same archive"). This is that claim, verified.
    const otherContext = await browser.newContext()
    const otherPage = await otherContext.newPage()
    await otherPage.goto('/history')

    await expect(
      otherPage.getByText('No history yet. Send a message in Chat to build your archive.'),
    ).toBeVisible()
    await expect(otherPage.locator('li.history-day__item')).toHaveCount(0)

    await otherContext.close()
  })

  test('a saved storageState lets a brand-new context start already seeded', async ({
    page,
    context,
    browser,
  }) => {
    await page.goto('/')
    await sendMessage(page, 'Ostriches assemble')

    // Capture this context's cookies + localStorage as a plain object...
    const storageState = await context.storageState()

    // ...and hand it to a new context up front. No UI setup needed here —
    // this context starts already "logged in" with history, the same trick
    // real apps use to skip a login flow in every test.
    const seededContext = await browser.newContext({ storageState })
    const seededPage = await seededContext.newPage()
    await seededPage.goto('/history')

    await expect(seededPage.locator('li.history-day__item')).toHaveCount(1)
    await expect(seededPage.locator('.history-exchange__text').first()).toHaveText(
      'Ostriches assemble',
    )

    await seededContext.close()
  })
})
