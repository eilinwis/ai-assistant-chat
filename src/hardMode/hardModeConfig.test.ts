import { describe, expect, it } from 'vitest'
import {
  ALL_FLAGS,
  ALL_SEEDS,
  coerceSeed,
  HARD_MODE_SETS,
  parseFlags,
  parseSeed,
  parseStored,
  randomSeed,
  resolveConfig,
} from './hardModeConfig'

const seed = () => 7

describe('resolveConfig', () => {
  it('is off when there is no URL param and nothing stored', () => {
    expect(resolveConfig('', null, seed)).toEqual({ enabled: false, flags: [], seed: 1 })
  })

  it('stays off for an unrelated query string or a bare ?seed=', () => {
    expect(resolveConfig('?q=hello', null, seed).enabled).toBe(false)
    expect(resolveConfig('?seed=4', null, seed).enabled).toBe(false)
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
    expect(resolveConfig('?hard=all&seed=4', null, seed)).toEqual({
      enabled: true,
      flags: [...ALL_FLAGS],
      seed: 4,
    })
  })

  it('takes a comma list and drops unknown flags', () => {
    expect(resolveConfig('?hard=popups,nope,latency&seed=1', null, seed).flags).toEqual([
      'popups',
      'latency',
    ])
  })

  it('generates a seed only when neither the URL nor storage has one', () => {
    expect(resolveConfig('?hard=popups', null, seed).seed).toBe(7)
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

describe('flag sets', () => {
  it('expands a set name to its flags', () => {
    expect(parseFlags('bad-network')).toEqual([
      'latency',
      'flaky-network',
      'rate-limit',
      'slow-history',
      'toasts',
    ])
  })

  it('mixes sets and single flags without duplicates', () => {
    expect(parseFlags('popups,tricky-dom,no-testids')).toEqual([
      'popups',
      'unstable-dom',
      'no-testids',
      'moving-target',
      'iframe-widget',
      'shadow-dom',
    ])
  })

  it('turns hard mode on from the URL by set name', () => {
    const config = resolveConfig('?hard=bad-network&seed=3', null, seed)
    expect(config).toEqual({ enabled: true, flags: [...HARD_MODE_SETS[0].flags], seed: 3 })
  })

  it('never names a set like a flag', () => {
    for (const set of HARD_MODE_SETS) {
      expect(ALL_FLAGS as readonly string[]).not.toContain(set.id)
    }
  })
})

describe('seed range', () => {
  it('is 1–10', () => {
    expect(ALL_SEEDS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('accepts only 1–10 when typed in by hand', () => {
    expect(parseSeed('1')).toBe(1)
    expect(parseSeed(' 10 ')).toBe(10)
    for (const bad of ['0', '11', '42', '-1', '2.5', 'abc', '', null]) {
      expect(parseSeed(bad)).toBeNull()
    }
  })

  it('folds old out-of-range seeds from URLs and storage into 1–10', () => {
    expect(coerceSeed('7')).toBe(7)
    expect(coerceSeed('10')).toBe(10)
    expect(coerceSeed('42')).toBe(2)
    expect(coerceSeed('0')).toBe(10)
    expect(coerceSeed('99999')).toBe(9)
    expect(coerceSeed('-3')).toBeNull()
    expect(coerceSeed('nope')).toBeNull()
  })

  it('keeps an old saved config working instead of turning hard mode off', () => {
    const stored = JSON.stringify({ enabled: true, flags: ['popups'], seed: 4242 })
    expect(parseStored(stored)).toEqual({ enabled: true, flags: ['popups'], seed: 2 })
    expect(resolveConfig('?hard=popups&seed=42', null, seed).seed).toBe(2)
  })

  it('generates seeds in range', () => {
    for (let i = 0; i < 200; i++) expect(ALL_SEEDS).toContain(randomSeed())
  })
})
