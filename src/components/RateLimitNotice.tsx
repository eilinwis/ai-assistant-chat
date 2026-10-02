import { useEffect, useState } from 'react'
import { useTid } from '../hardMode/useHardMode'

interface RateLimitNoticeProps {
  until: number
  onExpire: () => void
}

// Ticks on setInterval + Date.now, so page.clock can fast-forward it.
export default function RateLimitNotice({ until, onExpire }: RateLimitNoticeProps) {
  const tid = useTid()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  const remaining = until - now

  useEffect(() => {
    if (remaining <= 0) onExpire()
  }, [remaining, onExpire])

  return (
    <p className="chat-window__error" role="alert" {...tid('rate-limit-notice')}>
      Too many messages. Try again in {Math.max(1, Math.ceil(remaining / 1000))}s.
    </p>
  )
}
