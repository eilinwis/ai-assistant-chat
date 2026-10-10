import type { HardModeConfig } from './hardModeConfig'

// Hard mode reports what it does as console lines, so a test runner can
// collect them with `page.on('console')` — that survives reloads, crashes and
// extra tabs, which an in-page array does not. They go to console.debug, which
// DevTools hides by default; Playwright still receives them.
//
// Shared with e2e/hard-mode/test.ts (it parses these lines in Node), so keep
// this file free of browser-only and Vite-only code at module level.

export const EVENT_PREFIX = '[hard mode] event '

/** How many events window.__hardMode keeps for poking at in DevTools. */
export const MAX_KEPT_EVENTS = 200

export type EventData = Record<string, unknown>

export interface HardModeEvent {
  type: string
  data: EventData
}

export type Emit = (type: string, data?: EventData) => void

/** `[hard mode] event popups:promo-shown {"iteration":0}` */
export function formatEvent(type: string, data: EventData = {}): string {
  return `${EVENT_PREFIX}${type} ${JSON.stringify(data)}`
}

/** The inverse of formatEvent; anything else (other console output) → null. */
export function parseEvent(line: string): HardModeEvent | null {
  if (!line.startsWith(EVENT_PREFIX)) return null
  const rest = line.slice(EVENT_PREFIX.length)
  const space = rest.indexOf(' ')
  if (space <= 0) return null
  try {
    const data: unknown = JSON.parse(rest.slice(space + 1))
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
    return { type: rest.slice(0, space), data: data as EventData }
  } catch {
    return null
  }
}

/**
 * The `data-hard-mode` value on <html>: `seed=42;flags=latency,toasts`, or
 * `off`. Flags are sorted so two equal configs always read the same.
 */
export function formatMarker(config: HardModeConfig): string {
  if (!config.enabled) return 'off'
  return `seed=${config.seed};flags=${[...config.flags].sort().join(',')}`
}

export interface HardModeDebugState {
  enabled: boolean
  seed: number
  flags: string[]
  events: (HardModeEvent & { at: number })[]
}

declare global {
  interface Window {
    /** For manual debugging only — reset on every page load. */
    __hardMode?: HardModeDebugState
  }
}

export const emitEvent: Emit = (type, data = {}) => {
  console.debug(formatEvent(type, data))
  const state = window.__hardMode
  if (!state) return
  state.events.push({ type, data, at: Date.now() })
  if (state.events.length > MAX_KEPT_EVENTS) {
    state.events.splice(0, state.events.length - MAX_KEPT_EVENTS)
  }
}

/** Mirrors the active config onto <html data-hard-mode> and window.__hardMode. */
export function publishConfig(config: HardModeConfig): void {
  document.documentElement.dataset.hardMode = formatMarker(config)
  window.__hardMode = {
    enabled: config.enabled,
    seed: config.seed,
    flags: [...config.flags],
    events: window.__hardMode?.events ?? [],
  }
}
