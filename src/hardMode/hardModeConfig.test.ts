import { describe, expect, it } from 'vitest'
import { ALL_FLAGS, parseFlags, parseStored, resolveConfig } from './hardModeConfig'

const seed = () => 777

describe('resolveConfig', () => {
  it('is off when there is no URL param and nothing stored', () => {
    expect(resolveConfig('', null, seed)).toEqual({ enabled: false, flags: [], seed: 0 })
  })

  it('stays off for an unrelated query string or a bare ?seed=', () => {
    expect(resolveConfig('?q=hello', null, seed).enabled).toBe(false)
    expect(resolveConfig('?seed=42', null, seed).enabled).toBe(false)
  })

  it('stays off for garbage in storage', () => {
    expect(resolveConfig('', '{not json', seed).enabled).toBe(false)
    expect(resolveConfig('', '{"enabled":true}', seed).enabled).toBe(false)
    expect(resolveConfig('', '"on"', seed).enabled).toBe(false)
  })

  it('stays off when stored config says disabled', () => {
    const stored = JSON.stringify({ enabled: false, flags: ['popups'], seed: 5 })
    expect(resolveConfig('', stored, seed)).toEqual({
      enabled: false,
      flags: ['popups'],
      seed: 5,
    })
  })

  it('turns on with ?hard=all and the given seed', () => {
    expect(resolveConfig('?hard=all&seed=42', null, seed)).toEqual({
      enabled: true,
      flags: [...ALL_FLAGS],
      seed: 42,
    })
  })

  it('takes a comma list and drops unknown flags', () => {
    expect(resolveConfig('?hard=popups,nope,latency&seed=1', null, seed).flags).toEqual([
      'popups',
      'latency',
    ])
  })

  it('generates a seed only when neither the URL nor storage has one', () => {
    expect(resolveConfig('?hard=popups', null, seed).seed).toBe(777)
    const stored = JSON.stringify({ enabled: false, flags: [], seed: 9 })
    expect(resolveConfig('?hard=popups', stored, seed).seed).toBe(9)
  })

  it('lets the URL switch a stored hard mode off', () => {
    const stored = JSON.stringify({ enabled: true, flags: ['popups'], seed: 9 })
    for (const off of ['off', '0', 'none', 'false', '']) {
      expect(resolveConfig(`?hard=${off}`, stored, seed).enabled).toBe(false)
    }
  })

  it('treats a list of only unknown flags as off', () => {
    expect(resolveConfig('?hard=bogus', null, seed).enabled).toBe(false)
  })

  it('uses a stored, enabled config when the URL says nothing', () => {
    const stored = JSON.stringify({ enabled: true, flags: ['latency'], seed: 3 })
    expect(resolveConfig('', stored, seed)).toEqual({
      enabled: true,
      flags: ['latency'],
      seed: 3,
    })
  })
})

describe('parseFlags', () => {
  it('expands all / 1 / on', () => {
    for (const v of ['all', '1', 'on', 'ALL']) {
      expect(parseFlags(v)).toEqual([...ALL_FLAGS])
    }
  })

  it('de-duplicates', () => {
    expect(parseFlags('toasts,toasts')).toEqual(['toasts'])
  })
})

describe('parseStored', () => {
  it('filters out unknown flags', () => {
    expect(
      parseStored(JSON.stringify({ enabled: true, flags: ['popups', 'x', 3], seed: 1 })),
    ).toEqual({ enabled: true, flags: ['popups'], seed: 1 })
  })
})
