// npm run flake-score -- [test filters…] [options]
//
// Runs hard mode tests once per seed and scores how many seeds came out
// stable. It never turns hard mode on itself: a test does, with
// `test.use({ hardMode: … })`; this only picks the seed. Tests that don't
// turn it on run normally and aren't scored. See src/HARD_MODE.md.
//
//   (no filters)        e2e/hard-mode/, the hard mode suite
//   --config=<file>     the suite's own Playwright config (default: playwright.config.ts;
//                       a filter under lessons/ picks lessons/playwright.config.ts)
//   --seeds=<n>         only the first n seeds (default: all 10, seeds are 1–10)
//   --seed-list=<a,b>   exact seeds instead
//   --repeats=<n>       runs per seed (default 2); separates seed bugs from timing races
//   --workers=<n|%>     Playwright workers (default 50%)
//   --server=<mode>     preview (default) | dev | none (you run the app yourself)
//   --port=<n>          serve the app on another port than the config's baseURL
//                       (tests with hard-coded http://localhost:5173 won't follow)
//   --min=<percent>     exit 1 when the score is below this
//   --headed            show the browsers
//
// Node runs this file directly (type stripping), so: erasable TypeScript only.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_SEEDS, isSeed, SEED_MAX, SEED_MIN } from '../src/hardMode/hardModeConfig.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

function fail(message: string): never {
  console.error(`flake-score: ${message}`)
  process.exit(2)
}

const options = new Map<string, string>()
const filters: string[] = []
for (const arg of process.argv.slice(2)) {
  const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg)
  if (match) options.set(match[1], match[2] ?? 'true')
  else filters.push(arg)
}

const known = ['config', 'seeds', 'seed-list', 'repeats', 'workers', 'server', 'port', 'min', 'headed']
for (const key of options.keys()) {
  if (!known.includes(key)) fail(`unknown option --${key}`)
}

function intOption(name: string, fallback: number, min = 1): number {
  const raw = options.get(name)
  if (raw === undefined) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < min) fail(`--${name} must be an integer ≥ ${min}`)
  return value
}

// Which config: explicit, or guessed from the filters like .github/workflows/e2e.yml does.
const config =
  options.get('config') ??
  (filters.length > 0 && filters.every((f) => f.startsWith('lessons/'))
    ? 'lessons/playwright.config.ts'
    : 'playwright.config.ts')
if (!existsSync(path.resolve(config))) fail(`config not found: ${config}`)

// Which seeds. There are only ten, so by default every one of them runs.
let seeds: number[]
if (options.has('seed-list')) {
  seeds = [...new Set((options.get('seed-list') ?? '').split(',').map(Number))]
  if (!seeds.every(isSeed)) fail(`--seed-list takes seeds ${SEED_MIN}–${SEED_MAX}`)
} else {
  const count = intOption('seeds', ALL_SEEDS.length)
  if (count > ALL_SEEDS.length) fail(`--seeds is at most ${ALL_SEEDS.length}: seeds are ${SEED_MIN}–${SEED_MAX}`)
  seeds = ALL_SEEDS.slice(0, count)
}

// No filters and no config of your own: the hard mode suite.
const targets = filters.length === 0 && !options.has('config') ? ['e2e/hard-mode/'] : filters

const repeats = intOption('repeats', 2)
const server = options.get('server') ?? 'preview'
if (!['preview', 'dev', 'none'].includes(server)) fail('--server is preview, dev or none')
const out = path.join(root, 'flake-score-report')

const replayArgs = [
  options.has('config') ? `--config=${config}` : '',
  options.has('port') ? `--port=${options.get('port')}` : '',
]
  .filter(Boolean)
  .join(' ')

// A report left over from an earlier run must never be mistaken for this one.
rmSync(out, { recursive: true, force: true })

const result = spawnSync(
  'npx',
  ['playwright', 'test', '--config', path.join(root, 'config/flake-score.config.ts'), ...targets],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      FLAKE_BASE_CONFIG: path.resolve(config),
      FLAKE_SEEDS: seeds.join(','),
      FLAKE_REPEATS: String(repeats),
      FLAKE_WORKERS: options.get('workers') ?? '50%',
      FLAKE_SERVER: server,
      FLAKE_OUT: out,
      FLAKE_LABEL: targets.join(' ') || 'all tests',
      FLAKE_REPLAY_ARGS: replayArgs,
      ...(options.has('headed') ? { FLAKE_HEADED: '1' } : {}),
      ...(options.has('port') ? { FLAKE_PORT: String(intOption('port', 5173)) } : {}),
    },
  },
)

// Failing tests are what this run measures, so Playwright's own exit code
// (1 whenever a test failed) isn't ours. Only a missing report — config
// error, no tests found, server didn't start — means the run itself broke.
const reportPath = path.join(out, 'flake-score.json')
if (!existsSync(reportPath)) process.exit(result.status ?? 1)
const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { percent: number | null }

const min = options.get('min')
if (min !== undefined) {
  const threshold = Number(min)
  if (report.percent === null || report.percent < threshold) {
    console.error(`flake-score: ${report.percent ?? 'n/a'}% is below --min=${threshold}%`)
    process.exit(1)
  }
}
process.exit(0)
