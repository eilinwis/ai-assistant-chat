import { useEffect, useState } from 'react'
import { promoDelay } from '../promoSchedule'
import { useHardMode } from '../useHardMode'

// Keeps coming back: shown first at a seed-determined moment, then again after
// every close, each time waiting twice as long (see promoSchedule.ts). No test
// id, no Escape, no backdrop click — only its own buttons close it.
export default function PromoModal() {
  const { rand, toast, emit } = useHardMode()
  const [open, setOpen] = useState(false)
  const [iteration, setIteration] = useState(0)
  const delay = promoDelay(iteration, rand)

  useEffect(() => {
    if (open) return
    const id = setTimeout(() => {
      emit('popups:promo-shown', { iteration, afterMs: delay })
      setOpen(true)
    }, delay)
    return () => clearTimeout(id)
  }, [open, delay, iteration, emit])

  function close(action: 'later' | 'trial') {
    emit('popups:promo-closed', { iteration, action })
    setOpen(false)
    setIteration((n) => n + 1)
  }

  if (!open) return null

  return (
    <div className="hm-modal__backdrop">
      <div
        className="hm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hm-promo-title"
      >
        <h2 id="hm-promo-title" className="hm-modal__title">
          Upgrade to Chat Lab Pro
        </h2>
        <p className="hm-modal__body">
          Twice the jokes, half the latency. Start a free trial today — no
          credit card, no backend, no idea what Pro even does.
        </p>
        <div className="hm-modal__actions">
          <button type="button" className="hm-btn" onClick={() => close('later')}>
            Maybe later
          </button>
          <button
            type="button"
            className="hm-btn hm-btn--primary"
            onClick={() => {
              close('trial')
              toast('Trial started')
            }}
          >
            Start free trial
          </button>
        </div>
      </div>
    </div>
  )
}
