import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMessages, resetChat, sendChatMessage } from '../api/chatApi'
import { useChatHistory } from '../hooks/useChatHistory'
import { getAppAssistantReply, HELP_SUGGESTION_MESSAGE } from '../lib/appAssistantReply'
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
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to the newest content — a new message, or the "Thinking…"
    // indicator appearing/disappearing — instead of leaving it below the
    // fold until the user scrolls down manually. Guarded because jsdom
    // (used by this component's own unit tests) doesn't implement
    // Element.scrollTo.
    const list = listRef.current
    if (list && typeof list.scrollTo === 'function') {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

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
    async (text: string, options?: { forceAssistantMode?: boolean }) => {
      setError(null)
      const userMessage = createUserMessage(text)
      setMessages((prev) => [...prev, userMessage])
      setLoading(true)

      // Read from `options` rather than assuming a just-called setFunnyMode
      // has already taken effect — state updates aren't visible to this
      // closure until the next render, so this local override avoids a race
      // between "switch to assistant mode" and "send" happening together.
      const useFunnyMode = options?.forceAssistantMode ? false : funnyMode

      if (useFunnyMode) {
        try {
          await new Promise((r) => setTimeout(r, FUNNY_REPLY_DELAY_MS))
          const replyContent = getAppAssistantReply(text) ?? getFunnyReplyContent(text)
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
        // No real backend is configured (or it failed) — fall back to the
        // local app assistant for recognized questions, same as funny mode
        // does, instead of just erroring. Only applies when it actually
        // recognizes the message; anything else still surfaces the error.
        const fallbackContent = getAppAssistantReply(text)
        if (fallbackContent) {
          const reply = createFunnyAssistantMessage(text, fallbackContent)
          setMessages((prev) => [...prev, reply])
          recordSuccessfulExchange(userMessage, reply)
        } else {
          setError('Error: failed to get AI response')
        }
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

  const handleHelpSuggestion = useCallback(() => {
    // The Help menu only makes sense in Assistant mode (Funny mode would
    // just joke about it) — switch the toggle for next time, and force this
    // one send into assistant mode regardless of whether that switch has
    // been applied to state yet.
    setFunnyMode(false)
    void handleSend(HELP_SUGGESTION_MESSAGE, { forceAssistantMode: true })
  }, [handleSend])

  return (
    <div className="chat-window">
      <label className="chat-mode">
        <input
          type="checkbox"
          data-testid="funny-mode-toggle"
          checked={funnyMode}
          onChange={(e) => setFunnyMode(e.target.checked)}
          disabled={loading || !historyReady}
          className="chat-mode__checkbox"
        />
        <span className={`chat-mode__track${funnyMode ? ' chat-mode__track--funny' : ''}`}>
          <span className={`chat-mode__option${!funnyMode ? ' chat-mode__option--active' : ''}`}>
            Assistant mode
          </span>
          <span className={`chat-mode__option${funnyMode ? ' chat-mode__option--active' : ''}`}>
            Funny mode
          </span>
        </span>
      </label>
      <div className="chat-window__list" ref={listRef}>
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
      <div className="chat-suggestions">
        <button
          type="button"
          className="chat-suggestion"
          data-testid="help-suggestion"
          onClick={handleHelpSuggestion}
          disabled={loading || !historyReady}
        >
          Help
        </button>
      </div>
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
