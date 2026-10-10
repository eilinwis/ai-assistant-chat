import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig, type PlaywrightTestConfig } from '@playwright/test'

// Runs a Playwright suite once per seed. Not meant to be run directly —
// scripts/flake-score.ts sets the FLAKE_* variables below and starts
// Playwright with this file.
//
// It never turns hard mode on: each test does that itself with
// `test.use({ hardMode: … })` (e2e/hard-mode/test.ts). All this config sets
// is `hardSeed`, the seed those tests use unless they pin one. Tests that
// don't turn hard mode on run normally and aren't scored.

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set — run this through \`npm run flake-score\``)
  return value
}

const baseConfigPath = path.resolve(env('FLAKE_BASE_CONFIG'))
const base = ((await import(pathToFileURL(baseConfigPath).href)) as { default: PlaywrightTestConfig })
  .default
const baseDir = path.dirname(baseConfigPath)

const seeds = env('FLAKE_SEEDS').split(',').map(Number)
const repeats = Number(process.env.FLAKE_REPEATS ?? 2)
const server = process.env.FLAKE_SERVER ?? 'preview'
const out = path.resolve(process.env.FLAKE_OUT ?? path.join(projectRoot, 'flake-score-report'))
// The reporter runs in this same process and writes there too.
process.env.FLAKE_OUT = out
process.env.FLAKE_SEEDS = seeds.join(',')

const baseUse = { ...base.use, ...base.projects?.[0]?.use }
// --port moves the app off a port you're already using (say, your own
// `npm run dev`). Tests that hard-code http://localhost:5173 won't follow.
const baseURL = process.env.FLAKE_PORT
  ? `http://localhost:${process.env.FLAKE_PORT}`
  : (baseUse.baseURL ?? 'http://localhost:5173')
const port = new URL(baseURL).port || '80'

// The dev server compiles modules on first request; forty parallel browsers
// hitting it at once add flakiness of their own. A production build doesn't.
const webServer: PlaywrightTestConfig['webServer'] =
  server === 'none'
    ? undefined
    : server === 'dev'
      ? base.webServer
      : {
          command: `npm run build && npx vite preview --port ${port} --strictPort`,
          cwd: projectRoot,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 180_000,
        }

export default defineConfig<{ hardSeed: number }>({
  testDir: path.resolve(baseDir, base.testDir ?? '.'),
  testMatch: base.testMatch,
  testIgnore: base.testIgnore,
  timeout: base.timeout,
  expect: base.expect,
  fullyParallel: base.fullyParallel,
  // Retries would hide exactly the failures this run is here to count.
  retries: 0,
  repeatEach: repeats,
  workers: process.env.FLAKE_WORKERS ?? '50%',
  forbidOnly: true,
  outputDir: path.join(out, 'test-results'),
  // Only ours: Playwright's own reporters print every failure in full, and a
  // score run is expected to have hundreds of them.
  reporter: [[path.join(projectRoot, 'config/flakeScoreReporter.ts')]],
  webServer,
  projects: seeds.map((seed) => ({
    name: `seed-${seed}`,
    use: {
      ...baseUse,
      baseURL,
      headless: !process.env.FLAKE_HEADED,
      trace: 'retain-on-failure',
      hardSeed: seed,
    },
  })),
})
