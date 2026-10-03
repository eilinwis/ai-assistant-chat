import type { GetReply } from '../lib/replyService'
import type { HardModeFlag } from './hardModeConfig'

export class FlakyNetworkError extends Error {
  constructor() {
    super('Network error: message not delivered')
    this.name = 'FlakyNetworkError'
  }
}

export class RateLimitError extends Error {
  readonly retryAfterMs: number

  constructor(retryAfterMs: number) {
    super('Too many messages')
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

export const RATE_LIMIT = { max: 3, windowMs: 10_000 }
export const LATENCY_MS = { min: 100, max: 4000 }
const FLAKE_RATE = 0.35

/** Mutable per-page-load counters; lives in HardModeProvider, survives navigation. */
export interface HardModeRuntime {
  attempts: number
  lastAttemptFailed: boolean
  sendTimes: number[]
}

export function createRuntime(): HardModeRuntime {
  return { attempts: 0, lastAttemptFailed: false, sendTimes: [] }
}

export interface HardModeChaos {
  isOn: (flag: HardModeFlag) => boolean
  rand: (...keys: (string | number)[]) => number
  runtime: HardModeRuntime
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Wraps a reply source with the network-shaped hard-mode flags. Every random
 * draw is keyed by the attempt number, so a given seed replays the same
 * sequence of delays and failures for the same sequence of sends.
 */
export function withHardMode(getReply: GetReply, chaos: HardModeChaos): GetReply {
  return async (text, mode) => {
    const { isOn, rand, runtime } = chaos
    const now = (chaos.now ?? Date.now)()
    const sleep = chaos.sleep ?? defaultSleep

    if (isOn('rate-limit')) {
      runtime.sendTimes = runtime.sendTimes.filter((t) => now - t < RATE_LIMIT.windowMs)
      if (runtime.sendTimes.length >= RATE_LIMIT.max) {
        throw new RateLimitError(RATE_LIMIT.windowMs - (now - runtime.sendTimes[0]))
      }
      runtime.sendTimes.push(now)
    }

    const attempt = runtime.attempts++

    if (isOn('latency')) {
      const span = LATENCY_MS.max - LATENCY_MS.min
      await sleep(LATENCY_MS.min + Math.floor(rand('latency', attempt) * span))
    }

    if (isOn('flaky-network')) {
      // Never twice in a row, so a single Retry is always enough.
      const fail = !runtime.lastAttemptFailed && rand('flaky', attempt) < FLAKE_RATE
      runtime.lastAttemptFailed = fail
      if (fail) throw new FlakyNetworkError()
    }

    return getReply(text, mode)
  }
}
