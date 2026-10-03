import { useEffect, useState } from 'react'
import { formatRelative } from '../hardMode/relativeTime'
import { useHardMode, useTid } from '../hardMode/useHardMode'
import type { Message } from '../types/Message'

interface ChatMessageProps {
  message: Message
  /** When set (hard mode `time`), show a relative timestamp against it. */
  now?: number
}

type CopyState = 'idle' | 'copied' | 'failed'

export default function ChatMessage({ message, now }: ChatMessageProps) {
  const { isOn } = useHardMode()
  const tid = useTid()
  const [copy, setCopy] = useState<CopyState>('idle')
  const testId = message.role === 'user' ? 'message-user' : 'message-assistant'

  useEffect(() => {
    if (copy === 'idle') return
    const id = setTimeout(() => setCopy('idle'), 1500)
    return () => clearTimeout(id)
  }, [copy])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
  }

  const showCopy = message.role === 'assistant' && isOn('clipboard')
  const showMeta = now !== undefined || showCopy || message.failed

  return (
    <div
      className={`chat-message chat-message--${message.role}${
        message.failed ? ' chat-message--failed' : ''
      }`}
      {...tid(testId)}
    >
      <div className="chat-message__bubble">
        {message.content}
        {message.attachmentName ? (
          <span className="chat-message__attachment" {...tid('message-attachment')}>
            📎 {message.attachmentName}
          </span>
        ) : null}
        {message.imageSrc ? (
          <img
            className="chat-message__media"
            src={message.imageSrc}
            alt="General Grievous reaction"
            {...(message.role === 'assistant' ? tid('message-assistant-image') : {})}
          />
        ) : null}
        {showMeta && (
          <span className="chat-message__meta">
            {message.failed && <span className="chat-message__failed">Not delivered</span>}
            {now !== undefined && (
              <time dateTime={message.timestamp}>{formatRelative(message.timestamp, now)}</time>
            )}
            {showCopy && (
              <button type="button" className="chat-message__copy" onClick={handleCopy}>
                {copy === 'copied' ? 'Copied!' : copy === 'failed' ? 'Copy failed' : 'Copy'}
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
