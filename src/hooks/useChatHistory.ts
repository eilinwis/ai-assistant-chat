import { useContext } from 'react'
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from '../context/chatHistoryContext'

export function useChatHistory(): ChatHistoryContextValue {
  const ctx = useContext(ChatHistoryContext)
  if (!ctx) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider')
  }
  return ctx
}
