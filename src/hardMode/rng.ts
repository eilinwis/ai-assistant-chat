// Keyed, stateless randomness: every (seed, key) pair maps to one fixed
// number. There is no shared stream to advance, so the result never depends
// on how many times something rendered (StrictMode runs initializers twice in
// dev) or in which order features asked for their numbers.

function hashKey(input: string): number {
  // FNV-1a, 32-bit.
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** A number in [0, 1), fully determined by `seed` and `keys`. */
export function rand(seed: number, ...keys: (string | number)[]): number {
  // One mulberry32 step over the hashed key spreads nearby keys apart.
  let t = (hashKey(`${seed}:${keys.join(':')}`) + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
