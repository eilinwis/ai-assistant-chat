export const PROMO_FIRST_DELAY_MS = { min: 1000, max: 6000 }
export const PROMO_GROWTH = 2
export const PROMO_MAX_DELAY_MS = 20_000

/**
 * How long to wait before showing the promo for the `iteration`-th time
 * (0-based), counted from page load for the first one and from the previous
 * close for the rest. The first delay is seed-determined; each next one is
 * PROMO_GROWTH times longer, capped at PROMO_MAX_DELAY_MS.
 */
export function promoDelay(iteration: number, rand: (...keys: (string | number)[]) => number): number {
  const { min, max } = PROMO_FIRST_DELAY_MS
  const first = min + Math.floor(rand('promo-delay') * (max - min))
  return Math.min(first * PROMO_GROWTH ** iteration, PROMO_MAX_DELAY_MS)
}
