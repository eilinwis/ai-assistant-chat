import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, resetChat, sendChatMessage } from '../api/chatApi'
import { useChatHistory } from '../hooks/useChatHistory'
import {
  createFunnyAssistantMessage,
  getFunnyReplyContent,
} from '../lib/funnyReply'
import type { Message } from '../types/Message'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import LoadingMessage from './LoadingMessage'

const FUNNY_REPLY_DELAY_MS = 120

function createUserMessage(content: string): Message {
  return {
    id: `local-user-${crypto.randomUUID()}`,
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  }
}

export default function ChatWindow() {
  const { mergeServerMessages, recordSuccessfulExchange } = useChatHistory()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyReady, setHistoryReady] = useState(false)
  const [funnyMode, setFunnyMode] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const history = await fetchMessages()
        if (!cancelled) {
          setMessages(history)
          mergeServerMessages(history)
        }
      } catch {
        if (!cancelled) {
          setMessages([])
        }
      } finally {
        if (!cancelled) {
          setHistoryReady(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mergeServerMessages])

  const handleSend = useCallback(
    async (text: string) => {
      setError(null)
      const userMessage = createUserMessage(text)
      setMessages((prev) => [...prev, userMessage])
      setLoading(true)

      if (funnyMode) {
        try {
          await new Promise((r) => setTimeout(r, FUNNY_REPLY_DELAY_MS))
          const replyContent = getFunnyReplyContent(text)
          const reply = createFunnyAssistantMessage(text, replyContent)
          setMessages((prev) => [...prev, reply])
          recordSuccessfulExchange(userMessage, reply)
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        const reply = await sendChatMessage(text)
        setMessages((prev) => [...prev, reply])
        recordSuccessfulExchange(userMessage, reply)
      } catch {
        setError('Error: failed to get AI response')
      } finally {
        setLoading(false)
      }
    },
    [funnyMode, recordSuccessfulExchange],
  )

  const handleReset = useCallback(async () => {
    setError(null)
    // Clear the on-screen thread immediately — don't gate it on the backend
    // call below, since this app runs perfectly well with no backend at all
    // (Funny mode). Best-effort notify a real backend if one is configured.
    setMessages([])
    try {
      await resetChat()
    } catch {
      void 0
    }
  }, [])

  return (
    <div className="chat-window">
      <label className="chat-funny">
        <input
          type="checkbox"
          data-testid="funny-mode-toggle"
          checked={funnyMode}
          onChange={(e) => setFunnyMode(e.target.checked)}
          disabled={loading || !historyReady}
        />
        <span>Funny mode</span>
      </label>
      <div className="chat-window__list">
        {!historyReady && (
          <p className="chat-window__placeholder">Loading…</p>
        )}
        {historyReady && messages.length === 0 && !loading && (
          <p className="chat-window__placeholder">No messages yet.</p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && <LoadingMessage />}
      </div>
      <div className="chat-window__divider" role="presentation" />
      {error && (
        <p className="chat-window__error" data-testid="error-message">
          {error}
        </p>
      )}
      <ChatInput onSend={handleSend} disabled={loading || !historyReady} />
      <button
        type="button"
        className="chat-window__reset"
        data-testid="reset-button"
        onClick={handleReset}
        disabled={loading || !historyReady}
      >
        Reset Chat
      </button>
    </div>
  )
}
