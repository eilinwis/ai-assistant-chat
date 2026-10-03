import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { fetchMessages, resetChat } from '../api/chatApi'
import { useChatHistory } from '../hooks/useChatHistory'
import { HELP_SUGGESTION_MESSAGE } from '../lib/appAssistantReply'
import type { Message } from '../types/Message'
import { dayLabel, isSameDay } from '../hardMode/relativeTime'
import { useHardMode, useNow, useReplyService, useTid } from '../hardMode/useHardMode'
import { FlakyNetworkError, RateLimitError } from '../hardMode/withHardMode'
import FeedbackWidget from '../hardMode/widgets/FeedbackWidget'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import LoadingMessage from './LoadingMessage'
import RateLimitNotice from './RateLimitNotice'

interface SendOptions {
  forceAssistantMode?: boolean
  attachmentName?: string
}

interface PendingRetry {
  message: Message
  funny: boolean
}

function createUserMessage(content: string, attachmentName?: string): Message {
  return {
    id: `local-user-${crypto.randomUUID()}`,
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
    ...(attachmentName ? { attachmentName } : {}),
  }
}

export default function ChatWindow() {
  const { mergeServerMessages, recordSuccessfulExchange } = useChatHistory()
  const { isOn, toast } = useHardMode()
  const tid = useTid()
  const getReply = useReplyService()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyReady, setHistoryReady] = useState(false)
  const [funnyMode, setFunnyMode] = useState(true)
  const [pendingRetry, setPendingRetry] = useState<PendingRetry | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const showTime = isOn('time')
  const now = useNow(showTime)

  useEffect(() => {
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

  const setFailed = useCallback((id: string, failed: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, failed: failed || undefined } : m)),
    )
  }, [])

  const deliver = useCallback(
    async (userMessage: Message, funny: boolean) => {
      setLoading(true)
      try {
        const reply = await getReply(userMessage.content, funny ? 'funny' : 'assistant')
        setMessages((prev) => [...prev, reply])
        recordSuccessfulExchange(userMessage, reply)
        toast('Message sent')
      } catch (err) {
        if (err instanceof RateLimitError || err instanceof FlakyNetworkError) {
          setFailed(userMessage.id, true)
          setPendingRetry({ message: userMessage, funny })
          if (err instanceof RateLimitError) {
            setCooldownUntil(Date.now() + err.retryAfterMs)
          } else {
            setError(err.message)
          }
        } else {
          setError('Error: failed to get AI response')
        }
      } finally {
        setLoading(false)
      }
    },
    [getReply, recordSuccessfulExchange, setFailed, toast],
  )

  const handleSend = useCallback(
    async (text: string, options?: SendOptions) => {
      setError(null)
      setPendingRetry(null)
      const userMessage = createUserMessage(text, options?.attachmentName)
      setMessages((prev) => [...prev, userMessage])

      // Read from `options` rather than assuming a just-called setFunnyMode
      // has already taken effect — state updates aren't visible to this
      // closure until the next render, so this local override avoids a race
      // between "switch to assistant mode" and "send" happening together.
      const useFunnyMode = options?.forceAssistantMode ? false : funnyMode
      await deliver(userMessage, useFunnyMode)
    },
    [deliver, funnyMode],
  )

  const handleRetry = useCallback(async () => {
    if (!pendingRetry) return
    setError(null)
    setPendingRetry(null)
    setFailed(pendingRetry.message.id, false)
    await deliver(pendingRetry.message, pendingRetry.funny)
  }, [deliver, pendingRetry, setFailed])

  const handleReset = useCallback(async () => {
    if (
      isOn('popups') &&
      !window.confirm('Reset the chat? Messages on screen will be cleared.')
    ) {
      return
    }
    setError(null)
    setPendingRetry(null)
    // Clear the on-screen thread immediately — don't gate it on the backend
    // call below, since this app runs perfectly well with no backend at all
    // (Funny mode). Best-effort notify a real backend if one is configured.
    setMessages([])
    toast('Chat cleared')
    try {
      await resetChat()
    } catch {
      void 0
    }
  }, [isOn, toast])

  const handleHelpSuggestion = useCallback(() => {
    // The Help menu only makes sense in Assistant mode (Funny mode would
    // just joke about it) — switch the toggle for next time, and force this
    // one send into assistant mode regardless of whether that switch has
    // been applied to state yet.
    setFunnyMode(false)
    void handleSend(HELP_SUGGESTION_MESSAGE, { forceAssistantMode: true })
  }, [handleSend])

  const coolingDown = cooldownUntil !== null
  const busy = loading || !historyReady || coolingDown

  return (
    <div className="chat-window">
      <label className="chat-mode">
        <input
          type="checkbox"
          {...tid('funny-mode-toggle')}
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
        {messages.map((m, i) => (
          <Fragment key={m.id}>
            {showTime && (i === 0 || !isSameDay(messages[i - 1].timestamp, m.timestamp)) && (
              <div className="chat-day-divider" role="separator">
                {dayLabel(m.timestamp, now)}
              </div>
            )}
            <ChatMessage message={m} now={showTime ? now : undefined} />
          </Fragment>
        ))}
        {loading && <LoadingMessage />}
      </div>
      <div className="chat-window__divider" role="presentation" />
      {error && (
        <p className="chat-window__error" {...tid('error-message')}>
          {error}
          {pendingRetry && !coolingDown && (
            <button
              type="button"
              className="chat-window__retry"
              {...tid('retry-button')}
              onClick={handleRetry}
              disabled={loading}
            >
              Retry
            </button>
          )}
        </p>
      )}
      {cooldownUntil !== null && (
        <RateLimitNotice
          until={cooldownUntil}
          onExpire={() => {
            setCooldownUntil(null)
            if (pendingRetry) setError('Rate limited: message not delivered')
          }}
        />
      )}
      <div className="chat-suggestions">
        <button
          type="button"
          className="chat-suggestion"
          {...tid('help-suggestion')}
          onClick={handleHelpSuggestion}
          disabled={busy}
        >
          Help
        </button>
        {isOn('multi-tab') && (
          <button
            type="button"
            className="chat-suggestion"
            {...tid('open-history-window')}
            onClick={() => window.open('/history', '_blank')}
          >
            Open history in new window
          </button>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={busy} />
      <button
        type="button"
        className="chat-window__reset"
        {...tid('reset-button')}
        onClick={handleReset}
        disabled={busy}
      >
        Reset Chat
      </button>
      {isOn('shadow-dom') && <FeedbackWidget />}
    </div>
  )
}
