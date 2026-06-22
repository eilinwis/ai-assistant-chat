import { useCallback, useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  return (
    <div className="chat-input">
      <textarea
        className="chat-input__field"
        data-testid="chat-input"
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
      <button
        type="button"
        className="chat-input__send"
        data-testid="send-button"
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        Send
      </button>
    </div>
  )
}
