import { useEffect, useState } from 'react'
import { DISMISSAL_KEYS, readDismissal, writeDismissal } from '../dismissal'
import { useHardMode, useTid } from '../useHardMode'

// In localStorage on purpose: a test can skip the banner via storageState.
export default function CookieBanner() {
  const tid = useTid()
  const { emit } = useHardMode()
  const [open, setOpen] = useState(() => readDismissal(DISMISSAL_KEYS.consent) === null)

  // Fires once per page load at most: the banner only ever goes from open to
  // closed, never back.
  useEffect(() => {
    if (open) emit('popups:cookie-shown')
  }, [open, emit])

  function decide(choice: 'accepted' | 'rejected') {
    writeDismissal(DISMISSAL_KEYS.consent, choice)
    emit('popups:cookie-decided', { choice })
    setOpen(false)
  }

  if (!open) return null

  // The backdrop is transparent but catches every click until a choice is made.
  return (
    <div className="hm-cookie__backdrop">
      <div
        className="hm-cookie"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hm-cookie-title"
        {...tid('cookie-banner')}
      >
        <div className="hm-cookie__text">
          <h2 id="hm-cookie-title" className="hm-cookie__title">
            We value your privacy
          </h2>
          <p className="hm-cookie__body">
            We use cookies to make the chat feel snappier (it won't). Choose
            an option to continue.
          </p>
        </div>
        <div className="hm-cookie__actions">
          <button type="button" className="hm-btn" onClick={() => decide('rejected')}>
            Reject all
          </button>
          <button
            type="button"
            className="hm-btn hm-btn--primary"
            onClick={() => decide('accepted')}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
