import type { Locator, Page } from '@playwright/test'

export class ChatPage {
  /** Shell & status */
  readonly funnyModeCheckbox: Locator
  readonly loadingLabel: Locator
  readonly chatWindow: Locator
  readonly messageList: Locator
  readonly sectionDivider: Locator

  /** Composer */
  readonly messageInput: Locator
  readonly sendButton: Locator
  readonly resetChatButton: Locator

  /** Thread */
  readonly chatMessageFirst: Locator
  readonly chatMessageFirstReply: Locator

  constructor(page: Page) {
    this.funnyModeCheckbox = page.getByRole('checkbox', {
      name: /funny mode/i,
    })
    this.loadingLabel = page.getByText('Loading…')
    this.chatWindow = page.locator('.chat-window')
    this.messageList = page.locator('.chat-window__list')
    this.sectionDivider = page.locator('.chat-window__divider')

    this.messageInput = page.getByPlaceholder('Type a message…')
    this.sendButton = page.getByRole('button', { name: 'Send' })
    this.resetChatButton = page.getByRole('button', { name: 'Reset Chat' })

    this.chatMessageFirst = page
      .locator('.chat-message--user')
      .first()
      .locator('.chat-message__bubble')
    this.chatMessageFirstReply = page
      .locator('.chat-message--assistant')
      .first()
      .locator('.chat-message__bubble')
  }

  async sendMessage() {
    await this.sendButton.click()
  }

  async fillChatInput(message: string) {
    await this.messageInput.fill(message)
  }

  async getChatMessageFirstText() {
    return await this.chatMessageFirst.textContent()
  }

  async getChatMessageFirstReplyText() {
    return await this.chatMessageFirstReply.textContent()
  }
}
