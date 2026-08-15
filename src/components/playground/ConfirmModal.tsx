import { useEffect, useState } from 'react'

type ModalResult = 'confirmed' | 'cancelled'

export default function ConfirmModal() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<ModalResult | null>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function close(action: ModalResult) {
    setResult(action)
    setOpen(false)
  }

  return (
    <div className="widget-modal">
      <button
        type="button"
        className="widget-modal__open"
        data-testid="modal-open-button"
        onClick={() => setOpen(true)}
      >
        Open modal
      </button>
      {result && (
        <p className="widget-modal__result" data-testid="modal-result">
          Last action: {result}
        </p>
      )}
      {open && (
        <div
          className="widget-modal__backdrop"
          data-testid="modal-backdrop"
          onClick={() => close('cancelled')}
        >
          <div
            className="widget-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            data-testid="modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modal-title" className="widget-modal__title">
              Confirm action
            </h3>
            <p className="widget-modal__body">
              A training modal — practice waiting for it to appear,
              interacting with it, and asserting that it closes (via Confirm,
              Cancel, backdrop click, or Escape).
            </p>
            <div className="widget-modal__actions">
              <button
                type="button"
                className="widget-modal__cancel"
                data-testid="modal-cancel-button"
                onClick={() => close('cancelled')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="widget-modal__confirm"
                data-testid="modal-confirm-button"
                onClick={() => close('confirmed')}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
