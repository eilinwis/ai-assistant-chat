import type { Page } from '@playwright/test'
import { AppLayoutPage } from './layout/appLayoutPage'
import { ChatPage } from './chat/chatPage'
import { HelpPage } from './helpPage'
import { SearchPage } from './searchPage'

export class PageManager {
  private readonly page: Page
  private readonly appLayoutPage: AppLayoutPage
  private readonly chatPage: ChatPage
  private readonly searchPage: SearchPage
  private readonly helpPage: HelpPage

  constructor(page: Page) {
    this.page = page
    this.appLayoutPage = new AppLayoutPage(this.page)
    this.chatPage = new ChatPage(this.page)
    this.searchPage = new SearchPage(this.page)
    this.helpPage = new HelpPage(this.page)
  }

  onAppLayout() {
    return this.appLayoutPage
  }

  onChatPage() {
    return this.chatPage
  }

  onSearchPage() {
    return this.searchPage
  }

  onHelpPage() {
    return this.helpPage
  }
}