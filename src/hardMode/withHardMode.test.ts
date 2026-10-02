import { describe, expect, it, vi } from 'vitest'
import type { GetReply } from '../lib/replyService'
import type { Message } from '../types/Message'
import type { HardModeFlag } from './hardModeConfig'
import { rand } from './rng'
import {
  createRuntime,
  FlakyNetworkError,
  LATENCY_MS,
  RATE_LIMIT,
  RateLimitError,
  withHardMode,
} from './withHardMode'

const reply: Message = { id: 'a', role: 'assistant', content: 'hi', timestamp: '' }

function setup(flags: HardModeFlag[], seed = 42) {
  const inner = vi.fn<GetReply>().mockResolvedValue(reply)
  const sleep = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue()
  let clock = 0
  const wrapped = withHardMode(inner, {
    isOn: (f) => flags.includes(f),
    rand: (...keys) => rand(seed, ...keys),
    runtime: createRuntime(),
    now: () => clock,
    sleep,
  })
  return { inner, sleep, wrapped, tick: (ms: number) => (clock += ms) }
}

async function outcomes(wrapped: GetReply, n: number): Promise<string[]> {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    try {
      await wrapped('x', 'funny')
      out.push('ok')
    } catch (e) {
      out.push((e as Error).name)
    }
  }
  return out
}

describe('withHardMode', () => {
  it('is a pass-through with no flags on', async () => {
    const { inner, sleep, wrapped } = setup([])
    await expect(wrapped('hello', 'assistant')).resolves.toBe(reply)
    expect(inner).toHaveBeenCalledWith('hello', 'assistant')
    expect(sleep).not.toHaveBeenCalled()
  })

  it('latency: same seed → same delays; delays stay in range', async () => {
    const a = setup(['latency'])
    const b = setup(['latency'])
    await outcomes(a.wrapped, 5)
    await outcomes(b.wrapped, 5)
    const delays = a.sleep.mock.calls.map(([ms]) => ms)
    expect(b.sleep.mock.calls.map(([ms]) => ms)).toEqual(delays)
    for (const ms of delays) {
      expect(ms).toBeGreaterThanOrEqual(LATENCY_MS.min)
      expect(ms).toBeLessThan(LATENCY_MS.max)
    }
  })

  it('flaky-network: replays the same failures for the same seed, never twice in a row', async () => {
    const a = await outcomes(setup(['flaky-network'], 3).wrapped, 30)
    const b = await outcomes(setup(['flaky-network'], 3).wrapped, 30)
    expect(a).toEqual(b)
    expect(a).toContain('FlakyNetworkError')
    expect(a).toContain('ok')
    for (let i = 1; i < a.length; i++) {
      expect(a[i - 1] === 'FlakyNetworkError' && a[i] === 'FlakyNetworkError').toBe(false)
    }
  })

  it('flaky-network: a failure does not reach the inner reply source', async () => {
    const { inner, wrapped } = setup(['flaky-network'], 3)
    const results = await outcomes(wrapped, 30)
    expect(inner).toHaveBeenCalledTimes(results.filter((r) => r === 'ok').length)
    expect(new FlakyNetworkError().message).toMatch(/not delivered/)
  })

  it('rate-limit: blocks the 4th send inside the window, then recovers', async () => {
    const { wrapped, tick } = setup(['rate-limit'])
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      await wrapped('x', 'funny')
      tick(1000)
    }
    const err = await wrapped('x', 'funny').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(RateLimitError)
    expect((err as RateLimitError).retryAfterMs).toBe(RATE_LIMIT.windowMs - 3000)

    tick((err as RateLimitError).retryAfterMs)
    await expect(wrapped('x', 'funny')).resolves.toBe(reply)
  })
})
