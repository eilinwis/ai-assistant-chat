import { expect, test } from 'playwright/test'
import { PageManager } from '../pages/pageManager'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173')
})

const MESSAGE = 'Hello there!'
const REPLY = 'GENERAL KENOBI!!'

test.describe('Chat', () => {
  test('chat screen shows main UI controls', async ({ page }) => {
    const pageManager = new PageManager(page)
    const chat = pageManager.onChatPage()

    await expect(chat.funnyModeCheckbox).toBeEnabled({ timeout: 15_000 })
    await expect(chat.funnyModeCheckbox).toBeVisible()
    await expect(chat.loadingLabel).toBeHidden()
    await expect(chat.chatWindow).toBeVisible()
    await expect(chat.messageList).toBeVisible()
    await expect(chat.sectionDivider).toBeVisible()
    await expect(chat.messageInput).toBeVisible()
    await expect(chat.sendButton).toBeVisible()
    await expect(chat.resetChatButton).toBeVisible()
  })

  test('Should be able to send a message', async ({ page }) => {
    const pageManager = new PageManager(page)
    const chat = pageManager.onChatPage()

    await chat.fillChatInput(MESSAGE)
    await chat.sendMessage()
    await expect(chat.chatMessageFirst).toBeVisible()
    await expect(chat.chatMessageFirstReply).toBeVisible()
    await page.waitForTimeout(1000)
    expect(await chat.getChatMessageFirstText()).toBe(MESSAGE)
    expect(await chat.getChatMessageFirstReplyText()).toBe(REPLY)
  })
})
