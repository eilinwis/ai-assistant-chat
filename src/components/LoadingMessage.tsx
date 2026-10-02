import { useTid } from '../hardMode/useHardMode'

export default function LoadingMessage() {
  const tid = useTid()
  return (
    <div
      className="chat-message chat-message--assistant chat-message--loading"
      {...tid('loading-indicator')}
    >
      <div className="chat-message__bubble">Thinking...</div>
    </div>
  )
}
