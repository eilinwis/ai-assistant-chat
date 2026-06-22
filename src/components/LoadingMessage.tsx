export default function LoadingMessage() {
  return (
    <div
      className="chat-message chat-message--assistant chat-message--loading"
      data-testid="loading-indicator"
    >
      <div className="chat-message__bubble">Thinking...</div>
    </div>
  )
}
