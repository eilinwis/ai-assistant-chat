import SupportWidget from '../widgets/SupportWidget'
import { useHardMode } from '../useHardMode'
import CookieBanner from './CookieBanner'
import PromoModal from './PromoModal'

/** Page-level hard-mode layers that don't belong to any one screen. */
export default function OverlayRoot() {
  const { isOn, toasts } = useHardMode()

  return (
    <>
      {isOn('iframe-widget') && <SupportWidget />}
      {isOn('popups') && (
        <>
          <CookieBanner />
          <PromoModal />
        </>
      )}
      {isOn('toasts') && (
        <div className="hm-toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="hm-toast">
              {t.text}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
