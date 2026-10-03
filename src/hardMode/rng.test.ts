import { describe, expect, it } from 'vitest'
import { rand } from './rng'

describe('rand', () => {
  it('returns the same number for the same seed and key, regardless of call order', () => {
    const a1 = rand(42, 'promo-delay')
    rand(42, 'latency', 0)
    rand(42, 'latency', 1)
    expect(rand(42, 'promo-delay')).toBe(a1)
  })

  it('differs across seeds and keys', () => {
    expect(rand(1, 'x')).not.toBe(rand(2, 'x'))
    expect(rand(1, 'latency', 0)).not.toBe(rand(1, 'latency', 1))
  })

  it('stays in [0, 1) and is roughly uniform', () => {
    let sum = 0
    for (let i = 0; i < 2000; i++) {
      const v = rand(7, 'u', i)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      sum += v
    }
    expect(sum / 2000).toBeGreaterThan(0.45)
    expect(sum / 2000).toBeLessThan(0.55)
  })
})
