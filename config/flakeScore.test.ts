import { describe, expect, it } from 'vitest'
import { badgeJson, formatMarkdown, replayCommand, scoreRuns, type Run } from './flakeScore.ts'

const SEEDS = [1, 2, 3, 4]
const ctx = { baseArgs: '' }

/** `pattern[seedIndex][repeat]`: 'p' passed, 'f' failed. */
function runs(test: string, pattern: string[], extra: Partial<Run> = {}): Run[] {
  return pattern.flatMap((repeats, i) =>
    [...repeats].map((r) => ({
      test,
      seed: SEEDS[i],
      passed: r === 'p',
      error: r === 'p' ? undefined : `Error in ${test}`,
      flags: 'bad-network',
      ...extra,
    })),
  )
}

describe('scoreRuns', () => {
  it('scores 100% when everything passes', () => {
    const score = scoreRuns(runs('a.spec.ts:1 › a', ['pp', 'pp', 'pp', 'pp']), SEEDS)
    expect(score.percent).toBe(100)
    expect(score.stableSeeds).toEqual(SEEDS)
    expect(score.scoredTests).toBe(1)
  })

  it('a test that fails every run on every seed is broken, not flaky', () => {
    const score = scoreRuns(
      [
        ...runs('a.spec.ts:1 › broken', ['ff', 'ff', 'ff', 'ff']),
        ...runs('b.spec.ts:1 › fine', ['pp', 'pp', 'pp', 'pp']),
      ],
      SEEDS,
    )
    expect(score.broken.map((t) => t.test)).toEqual(['a.spec.ts:1 › broken'])
    expect(score.percent).toBe(100)
    expect(score.scoredTests).toBe(1)
  })

  it('separates seed-dependent failures from timing races', () => {
    const score = scoreRuns(
      [
        // seed 2 fails both repeats → replays by seed
        ...runs('a.spec.ts:1 › seedy', ['pp', 'ff', 'pp', 'pp']),
        // seed 4 fails one repeat of two → timing
        ...runs('b.spec.ts:1 › racy', ['pp', 'pp', 'pp', 'pf']),
      ],
      SEEDS,
    )
    expect(score.seedDependent).toEqual([
      {
        test: 'a.spec.ts:1 › seedy',
        flags: 'bad-network',
        seeds: [{ seed: 2, failed: 2, runs: 2, error: 'Error in a.spec.ts:1 › seedy', lastEvents: undefined }],
      },
    ])
    expect(score.timingDependent.map((t) => [t.test, t.seeds.map((s) => s.seed)])).toEqual([
      ['b.spec.ts:1 › racy', [4]],
    ])
    expect(score.stableSeeds).toEqual([1, 3])
    expect(score.percent).toBe(50)
  })

  it('leaves tests that ran with another config out of the score', () => {
    const score = scoreRuns(
      [
        ...runs('a.spec.ts:1 › cheats', ['pp', 'pp', 'pp', 'pp'], { mismatch: 'page 0: hard mode is off' }),
        ...runs('b.spec.ts:1 › honest', ['pp', 'ff', 'pp', 'pp']),
      ],
      SEEDS,
    )
    expect(score.mismatched).toEqual([{ test: 'a.spec.ts:1 › cheats', reason: 'page 0: hard mode is off' }])
    expect(score.scoredTests).toBe(1)
    expect(score.percent).toBe(75)
  })

  it("doesn't score tests that never turned hard mode on", () => {
    const score = scoreRuns(
      [
        ...runs('a.spec.ts:1 › normal', ['pp', 'ff', 'pp', 'pp'], { flags: undefined }),
        ...runs('b.spec.ts:1 › hard', ['pp', 'pp', 'pp', 'pp']),
      ],
      SEEDS,
    )
    expect(score.normalTests).toEqual(['a.spec.ts:1 › normal'])
    expect(score.scoredTests).toBe(1)
    expect(score.percent).toBe(100)
    expect(formatMarkdown(score, 'e2e/hard-mode/', ctx)).toContain("1 test(s) didn't turn hard mode on")
  })

  it('has no percentage when nothing could be scored', () => {
    const score = scoreRuns(runs('a.spec.ts:1 › broken', ['f', 'f', 'f', 'f']), SEEDS)
    expect(score.percent).toBeNull()
    expect(badgeJson(score, 'bad-network')).toMatchObject({ message: 'n/a', color: 'lightgrey' })
  })

  it('does not call a test broken when it never ran on some seeds', () => {
    const score = scoreRuns(runs('a.spec.ts:1 › partial', ['f', 'f']), SEEDS)
    expect(score.broken).toEqual([])
    expect(score.seedDependent).toHaveLength(1)
  })
})

describe('report', () => {
  it('replays a seed with the same base args', () => {
    expect(replayCommand('e2e/hard-mode/net.spec.ts:30 › Net › sends', 3, ctx)).toBe(
      'npm run flake-score -- e2e/hard-mode/net.spec.ts:30 --seed-list=3 --repeats=3',
    )
    expect(
      replayCommand('lessons/x.spec.ts:5 › y', 3, { baseArgs: '--config=lessons/playwright.config.ts' }),
    ).toBe(
      'npm run flake-score -- lessons/x.spec.ts:5 --config=lessons/playwright.config.ts --seed-list=3 --repeats=3',
    )
  })

  it('lists each kind of failure with what to do about it', () => {
    const score = scoreRuns(
      [
        ...runs('a.spec.ts:1 › seedy', ['pp', 'ff', 'pp', 'pp']),
        ...runs('b.spec.ts:1 › racy', ['pp', 'pp', 'pp', 'pf']),
        ...runs('c.spec.ts:1 › broken', ['ff', 'ff', 'ff', 'ff']),
      ],
      SEEDS,
    )
    const md = formatMarkdown(score, 'bad-network', ctx)
    expect(md).toContain('**2/4 seeds stable (50%)**')
    expect(md).toContain('#### Seed-dependent')
    expect(md).toContain('`/?hard=bad-network&seed=2`')
    expect(md).toContain('#### Timing-dependent')
    expect(md).toContain('4 (1 of 2 runs)')
    expect(md).toContain('#### Fails on every seed')
  })

  it('colours the badge by score', () => {
    const at = (percent: number) =>
      badgeJson({ ...scoreRuns([], SEEDS), percent }, 'bad-network').color
    expect(at(100)).toBe('brightgreen')
    expect(at(85)).toBe('yellow')
    expect(at(40)).toBe('red')
  })
})
