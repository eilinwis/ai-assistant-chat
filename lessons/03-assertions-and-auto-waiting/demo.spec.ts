import { test, expect, type Page } from '@playwright/test'

// Screen under test: Message history ("/history").
// Setup happens on the Chat screen ("/") — Funny mode needs no backend.

async function sendChatMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  const sendButton = page.getByTestId('send-button')

  await expect(chatInput).toBeEnabled({ timeout: 15_000 })
  await chatInput.fill(text)
  await sendButton.click()
  await expect(page.getByTestId('message-assistant').last()).toBeVisible()
}

// e.g. "Tuesday, August 11, 2026" — the format used by the app's day headings.
const FULL_DATE_PATTERN = /^[A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4}$/

test.describe('Lesson 3: Assertions & auto-waiting', () => {
  test('with no history yet, the empty state shows and delete is disabled', async ({ page }) => {
    await page.goto('/history')

    await expect(
      page.getByText('No history yet. Send a message in Chat to build your archive.'),
    ).toBeVisible()
    await expect(page.getByTestId('delete-history-button')).toBeDisabled()
    await expect(page.locator('li.history-day__item')).toHaveCount(0)
  })

  test('sending messages groups them under today and enables delete', async ({ page }) => {
    await page.goto('/')
    await sendChatMessage(page, 'Error is fun')
    await sendChatMessage(page, 'For the win')

    await page.getByTestId('nav-tab-history').click()
    await expect(page).toHaveURL(/\/history$/)

    const items = page.locator('li.history-day__item')
    await expect(items).toHaveCount(2)
    await expect(page.locator('.history-day__title').first()).toHaveText(FULL_DATE_PATTERN)
    await expect(page.getByTestId('delete-history-button')).toBeEnabled()

    // Two independent checks — with expect.soft, if the first one is wrong
    // we still find out about the second, instead of the test stopping early.
    // expect.soft still returns a normal, retrying web-first assertion —
    // only the "stop on failure" behavior changes.
    const firstTexts = items.first().locator('.history-exchange__text')
    await expect.soft(firstTexts.first()).toHaveText('Error is fun')
    await expect.soft(firstTexts.last()).toHaveText(
      'Error 418: I am a teapot and I deny all responsibility for your bugs.',
    )
  })
})
