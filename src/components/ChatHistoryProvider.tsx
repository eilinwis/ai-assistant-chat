import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ChatHistoryContext } from '../context/chatHistoryContext'
import type { Message } from '../types/Message'
import type { ChatExchange } from '../types/ChatExchange'
import {
  clearStoredExchanges,
  exchangesFromApiMessages,
  loadExchanges,
  upsertExchanges,
} from '../lib/chatHistoryStorage'

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [exchanges, setExchanges] = useState<ChatExchange[]>(() =>
    loadExchanges(),
  )

  const refresh = useCallback(() => {
    setExchanges(loadExchanges())
  }, [])

  const recordSuccessfulExchange = useCallback(
    (user: Message, assistant: Message) => {
      const ex: ChatExchange = {
        id: `session-${user.id}-${assistant.id}`,
        userContent: user.content,
        assistantContent: assistant.content,
        userTimestamp: user.timestamp,
        assistantTimestamp: assistant.timestamp,
        ...(assistant.imageSrc
          ? { assistantImageSrc: assistant.imageSrc }
          : {}),
      }
      upsertExchanges([ex])
      refresh()
    },
    [refresh],
  )

  const mergeServerMessages = useCallback(
    (messages: Message[]) => {
      const fromApi = exchangesFromApiMessages(messages)
      upsertExchanges(fromApi)
      refresh()
    },
    [refresh],
  )

  const clearAllHistory = useCallback(() => {
    clearStoredExchanges()
    setExchanges([])
  }, [])

  const value = useMemo(
    () => ({
      exchanges,
      recordSuccessfulExchange,
      mergeServerMessages,
      clearAllHistory,
    }),
    [exchanges, recordSuccessfulExchange, mergeServerMessages, clearAllHistory],
  )

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  )
}
