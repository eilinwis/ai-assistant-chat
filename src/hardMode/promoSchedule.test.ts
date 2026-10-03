import { describe, expect, it } from 'vitest'
import {
  PROMO_FIRST_DELAY_MS,
  PROMO_GROWTH,
  PROMO_MAX_DELAY_MS,
  promoDelay,
} from './promoSchedule'
import { rand } from './rng'

const seeded = (seed: number) => (...keys: (string | number)[]) => rand(seed, ...keys)

describe('promoDelay', () => {
  it('starts inside the first-delay range', () => {
    for (let seed = 0; seed < 50; seed++) {
      const d = promoDelay(0, seeded(seed))
      expect(d).toBeGreaterThanOrEqual(PROMO_FIRST_DELAY_MS.min)
      expect(d).toBeLessThan(PROMO_FIRST_DELAY_MS.max)
    }
  })

  it('grows by PROMO_GROWTH every iteration until it hits the cap', () => {
    for (let seed = 0; seed < 50; seed++) {
      const r = seeded(seed)
      for (let i = 1; i < 10; i++) {
        const prev = promoDelay(i - 1, r)
        expect(promoDelay(i, r)).toBe(Math.min(prev * PROMO_GROWTH, PROMO_MAX_DELAY_MS))
      }
    }
  })

  it('never exceeds the cap, and stays there', () => {
    const r = seeded(42)
    expect(promoDelay(100, r)).toBe(PROMO_MAX_DELAY_MS)
    for (let i = 0; i < 20; i++) {
      expect(promoDelay(i, r)).toBeLessThanOrEqual(PROMO_MAX_DELAY_MS)
    }
  })

  it('is the same schedule for the same seed', () => {
    const a = [0, 1, 2, 3].map((i) => promoDelay(i, seeded(7)))
    const b = [0, 1, 2, 3].map((i) => promoDelay(i, seeded(7)))
    expect(a).toEqual(b)
  })
})
