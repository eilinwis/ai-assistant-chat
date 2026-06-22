import type { Message } from '../types/Message'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const testId = message.role === 'user' ? 'message-user' : 'message-assistant'

  return (
    <div
      className={`chat-message chat-message--${message.role}`}
      data-testid={testId}
    >
      <div className="chat-message__bubble">
        {message.content}
        {message.imageSrc ? (
          <img
            className="chat-message__media"
            src={message.imageSrc}
            alt="General Grievous reaction"
            data-testid={
              message.role === 'assistant' ? 'message-assistant-image' : undefined
            }
          />
        ) : null}
      </div>
    </div>
  )
}
