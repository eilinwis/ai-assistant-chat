import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { useHardMode } from '../hardMode/useHardMode'

const SYNC_CHANNEL = 'chat-lab:history'

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [exchanges, setExchanges] = useState<ChatExchange[]>(() =>
    loadExchanges(),
  )
  const { isOn } = useHardMode()
  const syncTabs = isOn('multi-tab')
  const channelRef = useRef<BroadcastChannel | null>(null)

  const refresh = useCallback(() => {
    setExchanges(loadExchanges())
  }, [])

  // multi-tab: other tabs of this origin re-read storage when this one writes.
  useEffect(() => {
    if (!syncTabs || typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel(SYNC_CHANNEL)
    channel.onmessage = () => setExchanges(loadExchanges())
    channelRef.current = channel
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [syncTabs])

  const notifyTabs = useCallback(() => {
    channelRef.current?.postMessage('changed')
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
      notifyTabs()
    },
    [refresh, notifyTabs],
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
    notifyTabs()
  }, [notifyTabs])

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
