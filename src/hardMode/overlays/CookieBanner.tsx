import { useState } from 'react'
import { useTid } from '../useHardMode'

/** In localStorage on purpose: a test can skip the banner via storageState. */
const CONSENT_KEY = 'chat-lab:hard-mode:consent'

function hasDecided(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) !== null
  } catch {
    return false
  }
}

export default function CookieBanner() {
  const tid = useTid()
  const [open, setOpen] = useState(() => !hasDecided())

  function decide(choice: 'accepted' | 'rejected') {
    try {
      localStorage.setItem(CONSENT_KEY, choice)
    } catch {
      void 0
    }
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
