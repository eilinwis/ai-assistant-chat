import { useState } from 'react'
import { ALL_FLAGS, HARD_MODE_FLAGS, parseSeed, type HardModeFlag } from './hardModeConfig'
import { useHardMode } from './useHardMode'

// The controls keep their test ids even under `no-testids` — a test has to be
// able to find its way back out of hard mode.
export default function HardModeToggle() {
  const { config, setConfig } = useHardMode()
  const [panelOpen, setPanelOpen] = useState(false)
  const [seedDraft, setSeedDraft] = useState(String(config.seed))

  function toggle() {
    if (config.enabled) {
      setConfig({ ...config, enabled: false })
    } else {
      const flags = config.flags.length > 0 ? config.flags : [...ALL_FLAGS]
      setConfig({ ...config, enabled: true, flags })
    }
  }

  function setFlag(flag: HardModeFlag, on: boolean) {
    const flags = on
      ? ALL_FLAGS.filter((f) => f === flag || config.flags.includes(f))
      : config.flags.filter((f) => f !== flag)
    setConfig({ ...config, flags, enabled: config.enabled && flags.length > 0 })
  }

  function applySeed() {
    const seed = parseSeed(seedDraft)
    if (seed === null) {
      setSeedDraft(String(config.seed))
      return
    }
    setConfig({ ...config, seed })
  }

  return (
    <div className="hm-switch" role="group" aria-label="Hard mode">
      <button
        type="button"
        className={`hm-switch__toggle${config.enabled ? ' hm-switch__toggle--on' : ''}`}
        aria-pressed={config.enabled}
        data-testid="hard-mode-toggle"
        onClick={toggle}
      >
        Hard mode
        {config.enabled && (
          <span className="hm-switch__badge" data-testid="hard-mode-badge">
            seed {config.seed}
          </span>
        )}
      </button>
      <button
        type="button"
        className="hm-switch__gear"
        aria-label="Hard mode settings"
        aria-expanded={panelOpen}
        data-testid="hard-mode-settings"
        onClick={() => setPanelOpen((v) => !v)}
      >
        ⚙
      </button>
      {panelOpen && (
        <div className="hm-panel" data-testid="hard-mode-panel">
          <div className="hm-panel__row">
            <label className="hm-panel__seed">
              Seed
              <input
                type="text"
                inputMode="numeric"
                value={seedDraft}
                onChange={(e) => setSeedDraft(e.target.value)}
                onBlur={applySeed}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applySeed()
                }}
              />
            </label>
            <button
              type="button"
              className="hm-panel__bulk"
              onClick={() =>
                setConfig({ ...config, flags: [...ALL_FLAGS], enabled: config.enabled })
              }
            >
              All
            </button>
            <button
              type="button"
              className="hm-panel__bulk"
              onClick={() => setConfig({ ...config, flags: [], enabled: false })}
            >
              None
            </button>
          </div>
          <ul className="hm-panel__flags">
            {HARD_MODE_FLAGS.map((flag) => (
              <li key={flag.id}>
                <label className="hm-panel__flag">
                  <input
                    type="checkbox"
                    checked={config.flags.includes(flag.id)}
                    onChange={(e) => setFlag(flag.id, e.target.checked)}
                  />
                  <span>
                    <span className="hm-panel__flag-name">{flag.label}</span>
                    <span className="hm-panel__flag-hint">{flag.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="hm-panel__url">
            URL: <code>?hard={config.flags.length === ALL_FLAGS.length ? 'all' : config.flags.join(',') || 'off'}&amp;seed={config.seed}</code>
          </p>
        </div>
      )}
    </div>
  )
}
