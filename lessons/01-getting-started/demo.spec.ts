import { test, expect } from '@playwright/test'

// Screen under test: Chat ("/") — this repo's own AI Assistant Chat app.

test.describe('Lesson 1: Getting started', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the chat page loads with the expected title and heading', async ({ page }) => {
    await expect(page).toHaveTitle('AI Assistant Chat')
    await expect(
      page.getByRole('heading', { name: 'AI Assistant Chat', level: 1 }),
    ).toBeVisible()
  })

  test('sending "Hello there!" gets a canned reply', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')

    // The app needs a moment to finish loading chat history on start-up —
    // the input (and the Send button) stay disabled until then. Waiting on
    // the input is the reliable check: the Send button is *also* disabled
    // whenever it's empty, which isn't what we're waiting for here.
    await expect(chatInput).toBeEnabled({ timeout: 15_000 })

    await chatInput.fill('Hello there!')
    await sendButton.click()

    const reply = page.getByTestId('message-assistant').first()
    await expect(reply).toBeVisible()
    await expect(reply).toHaveText('GENERAL KENOBI!!')
  })
})
