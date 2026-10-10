import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter'
import { badgeJson, formatMarkdown, scoreRuns, type Run } from './flakeScore.ts'

// Collects every run of every seed project (`seed-<n>`, see
// flake-score.config.ts), scores them with flakeScore.ts and writes
// flake-score.json, flake-score.md and flake-score-badge.json to FLAKE_OUT.

const SEED_PROJECT = /^seed-(\d+)$/
const LAST_EVENTS = 5

function firstLine(text: string | undefined): string | undefined {
  // Playwright errors carry ANSI colour codes; strip them for the report.
  // eslint-disable-next-line no-control-regex
  return text?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').find((l) => l.trim())?.trim()
}

function lastEvents(result: TestResult): string[] | undefined {
  const journal = result.attachments.find((a) => a.name === 'hard-mode-events.json')
  if (!journal?.body) return undefined
  try {
    const events = JSON.parse(journal.body.toString()) as { type: string }[]
    return events.slice(-LAST_EVENTS).map((e) => e.type)
  } catch {
    return undefined
  }
}

export default class FlakeScoreReporter implements Reporter {
  private runs: Run[] = []
  private traces = new Map<string, string[]>()
  private rootDir = process.cwd()
  private total = 0
  private done = 0

  printsToStdio(): boolean {
    return true
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.rootDir = config.rootDir
    const seeds = suite.suites.filter((s) => SEED_PROJECT.test(s.title)).length
    this.total = suite.allTests().length
    console.log(`\nFlake Score: ${this.total} runs over ${seeds} seeds`)
  }

  onError(error: { message?: string }): void {
    console.error(`\n${error.message ?? 'Playwright error'}`)
  }

  private progress(passed: boolean | null): void {
    this.done++
    process.stdout.write(passed === null ? '·' : passed ? '.' : 'F')
    if (this.done % 80 === 0 || this.done === this.total) {
      process.stdout.write(` ${this.done}/${this.total}\n`)
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const project = test.parent.project()?.name ?? ''
    const match = SEED_PROJECT.exec(project)
    if (!match) return
    // A test can still set its own retries (describe.configure). Only the
    // first attempt counts: a retry is exactly what hides a flaky failure.
    if (result.retry > 0) return
    if (result.status === 'skipped' || result.status === 'interrupted') {
      this.progress(null)
      return
    }

    // titlePath: ['', project, file, ...describes, title]
    const file = path.relative(process.cwd(), test.location.file)
    const name = [`${file}:${test.location.line}`, ...test.titlePath().slice(3)].join(' › ')
    const annotations = [...result.annotations, ...test.annotations]
    // The fixture writes `flags=<what the test asked for> seed=… replay=…`.
    const hardMode = annotations.find((a) => a.type === 'hard-mode')?.description
    const passed = result.status === 'passed'
    this.progress(passed)

    this.runs.push({
      test: name,
      seed: Number(match[1]),
      passed,
      error: passed ? undefined : firstLine(result.error?.message),
      mismatch: annotations.find((a) => a.type === 'hard-mode-mismatch')?.description,
      flags: hardMode ? /^flags=(\S+)/.exec(hardMode)?.[1] : undefined,
      lastEvents: passed ? undefined : lastEvents(result),
    })

    for (const a of result.attachments) {
      if (a.name === 'trace' && a.path) {
        const list = this.traces.get(name) ?? []
        list.push(a.path)
        this.traces.set(name, list)
      }
    }
  }

  onEnd(): void {
    // Nothing ran (config error, no tests matched, server didn't start): no
    // report, so the wrapper reports Playwright's own failure instead.
    if (this.runs.length === 0) {
      console.log('\nFlake Score: no test ran, no report written.')
      return
    }
    const seeds = (process.env.FLAKE_SEEDS ?? '').split(',').filter(Boolean).map(Number)
    const label = process.env.FLAKE_LABEL ?? 'hard mode tests'
    const ctx = { baseArgs: process.env.FLAKE_REPLAY_ARGS ?? '' }
    const score = scoreRuns(this.runs, seeds)
    const markdown = formatMarkdown(score, label, ctx)

    const out = process.env.FLAKE_OUT ?? path.join(this.rootDir, 'flake-score-report')
    mkdirSync(out, { recursive: true })
    writeFileSync(path.join(out, 'flake-score.json'), JSON.stringify({ label, ...score }, null, 2))
    writeFileSync(path.join(out, 'flake-score.md'), markdown)
    writeFileSync(path.join(out, 'flake-score-badge.json'), JSON.stringify(badgeJson(score, 'hard mode')))

    // One trace per failing test is enough to debug it; 10 seeds × repeats of
    // the same failure would otherwise fill the disk.
    for (const paths of this.traces.values()) {
      for (const extra of paths.slice(1)) rmSync(extra, { force: true })
    }

    console.log(`\n${markdown}\nReport: ${path.relative(process.cwd(), out)}/flake-score.md`)
  }
}
