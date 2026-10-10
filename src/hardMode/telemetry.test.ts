import { afterEach, describe, expect, it, vi } from 'vitest'
import { HARD_MODE_OFF } from './hardModeConfig'
import {
  emitEvent,
  formatEvent,
  formatMarker,
  MAX_KEPT_EVENTS,
  parseEvent,
  publishConfig,
} from './telemetry'

afterEach(() => {
  vi.restoreAllMocks()
  delete window.__hardMode
  delete document.documentElement.dataset.hardMode
})

describe('formatEvent / parseEvent', () => {
  it('round-trips type and data', () => {
    const line = formatEvent('popups:promo-shown', { iteration: 2, afterMs: 3000 })
    expect(line).toBe('[hard mode] event popups:promo-shown {"iteration":2,"afterMs":3000}')
    expect(parseEvent(line)).toEqual({
      type: 'popups:promo-shown',
      data: { iteration: 2, afterMs: 3000 },
    })
  })

  it('defaults data to an empty object', () => {
    expect(parseEvent(formatEvent('popups:cookie-shown'))).toEqual({
      type: 'popups:cookie-shown',
      data: {},
    })
  })

  it('ignores other console output and malformed lines', () => {
    expect(parseEvent('[hard mode] seed=42 flags=latency')).toBeNull()
    expect(parseEvent('[hard mode] event nodata')).toBeNull()
    expect(parseEvent('[hard mode] event x {broken')).toBeNull()
    expect(parseEvent('[hard mode] event x [1,2]')).toBeNull()
    expect(parseEvent('hello')).toBeNull()
  })
})

describe('formatMarker', () => {
  it('is "off" when disabled, whatever the flags', () => {
    expect(formatMarker({ ...HARD_MODE_OFF, flags: ['latency'] })).toBe('off')
  })

  it('sorts flags so equal configs read the same', () => {
    expect(formatMarker({ enabled: true, seed: 42, flags: ['toasts', 'latency'] })).toBe(
      'seed=42;flags=latency,toasts',
    )
  })
})

describe('emitEvent / publishConfig', () => {
  it('logs to console.debug, never console.log/info', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    emitEvent('latency', { ms: 120 })
    expect(debug).toHaveBeenCalledWith('[hard mode] event latency {"ms":120}')
    expect(info).not.toHaveBeenCalled()
  })

  it('sets the <html> marker and keeps events across config changes', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    publishConfig({ enabled: true, seed: 1, flags: ['popups'] })
    emitEvent('popups:cookie-shown')
    publishConfig({ enabled: false, seed: 1, flags: ['popups'] })

    expect(document.documentElement.dataset.hardMode).toBe('off')
    expect(window.__hardMode?.enabled).toBe(false)
    expect(window.__hardMode?.events.map((e) => e.type)).toEqual(['popups:cookie-shown'])
  })

  it(`keeps only the last ${MAX_KEPT_EVENTS} events`, () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    publishConfig({ enabled: true, seed: 1, flags: [] })
    for (let i = 0; i < MAX_KEPT_EVENTS + 5; i++) emitEvent('tick', { i })

    const events = window.__hardMode?.events ?? []
    expect(events).toHaveLength(MAX_KEPT_EVENTS)
    expect(events[0].data).toEqual({ i: 5 })
  })
})
