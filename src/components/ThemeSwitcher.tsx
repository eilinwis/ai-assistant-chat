import { useEffect, useState } from 'react'
import { useTid } from '../hardMode/useHardMode'

const THEMES = [
  { id: 'aurora', label: 'Aurora', hint: 'Aurora theme — blue glass' },
  { id: 'runner', label: 'Test Runner', hint: 'Test Runner theme — green terminal' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

const STORAGE_KEY = 'chat-lab:theme'
const DEFAULT_THEME: ThemeId = 'aurora'

function isThemeId(value: string | null): value is ThemeId {
  return value === 'aurora' || value === 'runner'
}

function readStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return isThemeId(saved) ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme)
  const tid = useTid()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      void 0
    }
  }, [theme])

  return (
    <div className="theme-switch" role="group" aria-label="Colour theme">
      {THEMES.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`theme-switch__dot theme-switch__dot--${option.id}${
            theme === option.id ? ' theme-switch__dot--active' : ''
          }`}
          {...tid(`theme-${option.id}`)}
          aria-pressed={theme === option.id}
          title={option.hint}
          onClick={() => setTheme(option.id)}
        >
          <span className="theme-switch__label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
