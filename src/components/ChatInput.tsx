import { useCallback, useRef, useState } from 'react'
import { useHardMode, useTid } from '../hardMode/useHardMode'

interface ChatInputProps {
  onSend: (text: string, options?: { attachmentName?: string }) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { isOn } = useHardMode()
  const tid = useTid()
  const [value, setValue] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const [tipOpen, setTipOpen] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const movingTarget = isOn('moving-target')

  const clearAttachment = useCallback(() => {
    setAttachment(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, attachment ? { attachmentName: attachment } : undefined)
    setValue('')
    clearAttachment()
  }, [value, disabled, onSend, attachment, clearAttachment])

  return (
    <div className="chat-input">
      <div className="chat-input__main">
        <textarea
          className="chat-input__field"
          {...tid('chat-input')}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={3}
          placeholder="Type a message…"
        />
        {isOn('files') && (
          <div className="chat-input__files">
            <label className="chat-input__attach">
              Attach file
              <input
                ref={fileRef}
                type="file"
                className="visually-hidden"
                {...tid('attach-input')}
                disabled={disabled}
                onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? null)}
              />
            </label>
            {attachment && (
              <span className="chat-input__chip" {...tid('attachment-chip')}>
                📎 {attachment}
                <button
                  type="button"
                  className="chat-input__chip-remove"
                  aria-label="Remove attachment"
                  onClick={clearAttachment}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`chat-input__send${movingTarget ? ' chat-input__send--moving' : ''}`}
        {...tid('send-button')}
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        Send
      </button>
      {movingTarget && tipOpen && (
        <div className="chat-input__tip" role="note">
          Tip: press Enter to send
          <button
            type="button"
            className="chat-input__tip-close"
            aria-label="Dismiss tip"
            onClick={() => setTipOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
