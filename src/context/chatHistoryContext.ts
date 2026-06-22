import { createContext } from 'react'
import type { Message } from '../types/Message'
import type { ChatExchange } from '../types/ChatExchange'

export interface ChatHistoryContextValue {
  exchanges: ChatExchange[]
  recordSuccessfulExchange: (user: Message, assistant: Message) => void
  mergeServerMessages: (messages: Message[]) => void
  clearAllHistory: () => void
}

export const ChatHistoryContext =
  createContext<ChatHistoryContextValue | null>(null)
