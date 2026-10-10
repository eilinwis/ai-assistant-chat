// Flake Score: pure logic, no Playwright or file system — the reporter
// (flakeScoreReporter.ts) feeds it runs, the wrapper (scripts/flake-score.ts)
// and the unit tests (flakeScore.test.ts) read what it returns.

/** One finished run of one test under one seed (one of its repeats). */
export interface Run {
  /** `file:line › describe › title` — the same for every seed and repeat. */
  test: string
  seed: number
  passed: boolean
  /** First line of the error, for failed runs. */
  error?: string
  /** Set when the test ran with another config than it asked for (fixture check). */
  mismatch?: string
  /**
   * The test's own `hardMode.flags`, or undefined when it didn't turn hard
   * mode on — a normal test, which Flake Score doesn't score.
   */
  flags?: string
  /** Last few hard mode events before a failure, from the fixture's journal. */
  lastEvents?: string[]
}

export interface SeedFailure {
  seed: number
  failed: number
  runs: number
  error?: string
  lastEvents?: string[]
}

export interface TestFailures {
  test: string
  /** The test's `hardMode.flags`, for replaying it. */
  flags: string
  seeds: SeedFailure[]
}

export interface FlakeScore {
  seeds: number[]
  /** Seeds on which every scored test passed in every repeat. */
  stableSeeds: number[]
  /** stableSeeds / seeds, 0–100, rounded down; null when nothing was scored. */
  percent: number | null
  /** Failed every run on every seed: doesn't handle the flags at all. Not scored. */
  broken: TestFailures[]
  /** Failed every repeat of some seeds: replays by seed. */
  seedDependent: TestFailures[]
  /** Failed only some repeats of a seed: a timing race the seed doesn't replay. */
  timingDependent: TestFailures[]
  /** Ran with another config than asked (e.g. opened `/?hard=off`). Not scored. */
  mismatched: { test: string; reason: string }[]
  /** Didn't turn hard mode on: normal tests that ended up in the run. Not scored. */
  normalTests: string[]
  scoredTests: number
}

function groupBy<T>(items: T[], key: (item: T) => string | number): Map<string | number, T[]> {
  const groups = new Map<string | number, T[]>()
  for (const item of items) {
    const k = key(item)
    const group = groups.get(k)
    if (group) group.push(item)
    else groups.set(k, [item])
  }
  return groups
}

function seedFailure(seed: number, runs: Run[]): SeedFailure {
  const failed = runs.filter((r) => !r.passed)
  return {
    seed,
    failed: failed.length,
    runs: runs.length,
    error: failed[0]?.error,
    lastEvents: failed[0]?.lastEvents,
  }
}

export function scoreRuns(runs: Run[], seeds: number[]): FlakeScore {
  const result: FlakeScore = {
    seeds: [...seeds],
    stableSeeds: [],
    percent: null,
    broken: [],
    seedDependent: [],
    timingDependent: [],
    mismatched: [],
    normalTests: [],
    scoredTests: 0,
  }
  const unstable = new Set<number>()

  for (const [test, testRuns] of groupBy(runs, (r) => r.test)) {
    const name = String(test)
    const flags = testRuns.find((r) => r.flags)?.flags
    if (!flags) {
      result.normalTests.push(name)
      continue
    }
    const mismatch = testRuns.find((r) => r.mismatch)
    if (mismatch) {
      result.mismatched.push({ test: name, reason: mismatch.mismatch ?? '' })
      continue
    }

    const bySeed = [...groupBy(testRuns, (r) => r.seed)].map(([seed, seedRuns]) =>
      seedFailure(Number(seed), seedRuns),
    )
    const allFailed = bySeed.every((s) => s.failed === s.runs)
    if (allFailed && bySeed.length === seeds.length) {
      result.broken.push({ test: name, flags, seeds: bySeed })
      continue
    }

    result.scoredTests++

    const red = bySeed.filter((s) => s.failed > 0 && s.failed === s.runs)
    const mixed = bySeed.filter((s) => s.failed > 0 && s.failed < s.runs)
    if (red.length > 0) result.seedDependent.push({ test: name, flags, seeds: red })
    if (mixed.length > 0) result.timingDependent.push({ test: name, flags, seeds: mixed })
    for (const s of [...red, ...mixed]) unstable.add(s.seed)
  }

  if (result.scoredTests > 0) {
    result.stableSeeds = seeds.filter((s) => !unstable.has(s))
    result.percent = Math.floor((result.stableSeeds.length / seeds.length) * 100)
  }
  return result
}

/** What the report says to run to replay a seed. */
export interface ReplayContext {
  /** `npm run flake-score -- …` arguments that select the same base config. */
  baseArgs: string
}

function testFileAndLine(test: string): string {
  return test.split(' › ')[0]
}

export function replayCommand(test: string, seed: number, ctx: ReplayContext): string {
  return ['npm run flake-score --', testFileAndLine(test), ctx.baseArgs, `--seed-list=${seed} --repeats=3`]
    .filter(Boolean)
    .join(' ')
}

export function replayUrlFor(flags: string, seed: number): string {
  return `/?hard=${flags}&seed=${seed}`
}

function seedList(seeds: SeedFailure[], withRuns: boolean): string {
  return seeds
    .map((s) => (withRuns ? `${s.seed} (${s.failed} of ${s.runs} runs)` : String(s.seed)))
    .join(', ')
}

/** Markdown report: the PR comment and flake-score.md. */
export function formatMarkdown(score: FlakeScore, label: string, ctx: ReplayContext): string {
  const lines: string[] = []
  const headline =
    score.percent === null
      ? 'no test was scored'
      : `**${score.stableSeeds.length}/${score.seeds.length} seeds stable (${score.percent}%)**`
  lines.push(`### Flake Score — ${label}: ${headline}`, '')
  lines.push(`Seeds: ${score.seeds.join(', ')}`, '')

  if (score.seedDependent.length > 0) {
    lines.push('#### Seed-dependent — fails every run of these seeds, replays by seed', '')
    for (const t of score.seedDependent) {
      const first = t.seeds[0]
      lines.push(`- \`${t.test}\` — seeds ${seedList(t.seeds, false)}`)
      if (first.error) lines.push(`  - error: \`${first.error}\``)
      if (first.lastEvents?.length) lines.push(`  - last hard mode events: ${first.lastEvents.join(' → ')}`)
      lines.push(`  - replay: \`${replayCommand(t.test, first.seed, ctx)}\` or open \`${replayUrlFor(t.flags, first.seed)}\``)
    }
    lines.push('')
  }
  if (score.timingDependent.length > 0) {
    lines.push('#### Timing-dependent — fails only some runs of a seed; the seed alone does not replay it', '')
    for (const t of score.timingDependent) {
      lines.push(`- \`${t.test}\` — seeds ${seedList(t.seeds, true)}`)
      if (t.seeds[0].error) lines.push(`  - error: \`${t.seeds[0].error}\``)
    }
    lines.push('')
  }
  if (score.broken.length > 0) {
    lines.push("#### Fails on every seed — doesn't handle these flags yet (not counted as flaky)", '')
    for (const t of score.broken) {
      lines.push(`- \`${t.test}\`${t.seeds[0].error ? ` — \`${t.seeds[0].error}\`` : ''}`)
    }
    lines.push('')
  }
  if (score.mismatched.length > 0) {
    lines.push('#### Not verified — ran with another hard mode config (not counted)', '')
    for (const m of score.mismatched) lines.push(`- \`${m.test}\` — ${m.reason}`)
    lines.push('')
  }
  if (score.normalTests.length > 0) {
    lines.push(
      `_${score.normalTests.length} test(s) didn't turn hard mode on (\`test.use({ hardMode: … })\`) and weren't scored._`,
      '',
    )
  }
  return lines.join('\n')
}

/** shields.io endpoint JSON (https://shields.io/badges/endpoint-badge). */
export function badgeJson(score: FlakeScore, label: string) {
  const p = score.percent
  const color = p === null ? 'lightgrey' : p >= 95 ? 'brightgreen' : p >= 80 ? 'yellow' : 'red'
  return {
    schemaVersion: 1,
    label: `flake score (${label})`,
    message: p === null ? 'n/a' : `${p}%`,
    color,
  }
}
