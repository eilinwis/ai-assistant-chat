import { test, expect } from '@playwright/test'

// Screen under test: Chat ("/") — same screen as Lesson 1, deeper toolset.

test.describe('Lesson 4: Forms & input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
  })

  test('the funny mode checkbox can be toggled', async ({ page }) => {
    const funnyMode = page.getByTestId('funny-mode-toggle')

    await expect(funnyMode).toBeChecked() // on by default

    await funnyMode.uncheck()
    await expect(funnyMode).not.toBeChecked()

    await funnyMode.check()
    await expect(funnyMode).toBeChecked()
  })

  test('Shift+Enter adds a newline, Enter submits', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input')

    await chatInput.pressSequentially('Line one')
    await chatInput.press('Shift+Enter')
    await chatInput.pressSequentially('Line two')
    await expect(chatInput).toHaveValue('Line one\nLine two')

    await chatInput.press('Enter')

    await expect(chatInput).toHaveValue('') // cleared after submit
    const userMessage = page.getByTestId('message-user').first()
    await expect(userMessage).toHaveText('Line one\nLine two') // whitespace-normalized
    await expect(page.getByTestId('message-assistant').first()).toBeVisible()
  })

  test('the Send button stays disabled for whitespace-only input', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')

    await chatInput.fill('   ')
    await expect(sendButton).toBeDisabled()

    await chatInput.fill('   real text   ')
    await expect(sendButton).toBeEnabled()
  })
})
