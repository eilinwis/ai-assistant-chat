import { STORAGE_KEY } from '../../src/hardMode/hardModeConfig.ts'

// Node-safe on purpose: the Flake Score reporter and config import this, so
// nothing here may pull in browser-only code (test.ts re-exports it).

/** localStorage keys the fixture writes before the app's first load. */
export const HARD_MODE_STORAGE_KEY = STORAGE_KEY
/** Set once the fixture has applied a test's config in a browser context. */
export const APPLIED_KEY = 'chat-lab:hard-mode:applied-by-test'

/** The saved-config JSON the app reads on boot (see resolveConfig). */
export function storedConfig(flags: string[], seed: number): string {
  return JSON.stringify({ enabled: true, flags, seed })
}

/** The URL that replays a hard mode run by hand; `flags` may be a set name. */
export function replayUrl(flags: string, seed: number): string {
  return `/?hard=${flags}&seed=${seed}`
}
