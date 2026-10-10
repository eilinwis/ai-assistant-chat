// "Shown once" state for hard-mode overlays. A test skips an overlay by
// setting its key before the page loads (storageState or addInitScript), so
// these key names are public API: HARD_MODE.md lists them and people's tests
// depend on them. Add new keys; never rename existing ones.

export const DISMISSAL_KEYS = {
  /** Cookie banner choice: 'accepted' | 'rejected'. */
  consent: 'chat-lab:hard-mode:consent',
} as const

export type DismissalKey = (typeof DISMISSAL_KEYS)[keyof typeof DISMISSAL_KEYS]

/** localStorage survives across sessions; sessionStorage only within a tab. */
export type DismissalScope = 'local' | 'session'

function storageFor(scope: DismissalScope): Storage {
  return scope === 'session' ? sessionStorage : localStorage
}

/** The stored value, or null when unset or storage is unavailable. */
export function readDismissal(key: DismissalKey, scope: DismissalScope = 'local'): string | null {
  try {
    return storageFor(scope).getItem(key)
  } catch {
    return null
  }
}

export function writeDismissal(
  key: DismissalKey,
  value: string,
  scope: DismissalScope = 'local',
): void {
  try {
    storageFor(scope).setItem(key, value)
  } catch {
    void 0
  }
}
