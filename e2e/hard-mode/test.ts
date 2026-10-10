import { test as base, expect, type Page } from '@playwright/test'
import { isSeed, parseFlags, SEED_MIN } from '../../src/hardMode/hardModeConfig'
import { parseEvent, type EventData, type HardModeEvent } from '../../src/hardMode/telemetry'
import { APPLIED_KEY, HARD_MODE_STORAGE_KEY, replayUrl, storedConfig } from './storage'

export { replayUrl } from './storage'

/**
 * The fixture for hard mode tests. Hard mode is never on unless a test asks
 * for it, explicitly:
 *
 *   import { expect, test } from '../hard-mode/test'
 *   test.use({ hardMode: { flags: 'bad-network' } })
 *
 * `flags` takes what `?hard=` takes: a set name, or a comma list of flags.
 * `seed` (1–10) is optional: left out, the run's `hardSeed` is used — 1 in a
 * plain run, each of 1–10 in turn under Flake Score. Pin it only for a test
 * about one specific scenario; a pinned seed is the same on every Flake
 * Score seed.
 *
 * For a test with `hardMode` set, the fixture:
 * - turns hard mode on before the app's first load (once per browser
 *   context, so a test that changes flags in the UI and reloads keeps its
 *   change);
 * - checks every page load against that config: a test that ends up with
 *   other flags (say, it opened `/?hard=off`) gets a `hard-mode-mismatch`
 *   annotation instead of passing as if it had coped;
 * - keeps a journal of every hard mode event from every page, attached to
 *   the report when the test fails.
 *
 * Without `hardMode` it does nothing at all.
 */

export interface HardModeRun {
  /** A set name (`bad-network`) or a comma list of flags (`popups,latency`). */
  flags: string
  /** 1–10; defaults to the run's `hardSeed`. */
  seed?: number
}

export interface JournalEntry extends HardModeEvent {
  /** Index of the page in the test's context, in order of creation. */
  page: number
  /** Milliseconds since the fixture started. */
  at: number
}

export interface HardModeJournal {
  events: JournalEntry[]
  mismatches: string[]
}

interface Expected {
  seed: number
  flags: string[]
}

/** Why a `config` event doesn't match what was expected, or null if it does. */
export function describeMismatch(expected: Expected, actual: EventData): string | null {
  if (actual.enabled !== true) return 'hard mode is off'
  if (actual.seed !== expected.seed) {
    return `seed ${String(actual.seed)}, expected ${expected.seed}`
  }
  const flags = Array.isArray(actual.flags) ? actual.flags.map(String).sort() : []
  const want = [...expected.flags].sort()
  if (flags.join(',') !== want.join(',')) {
    return `flags ${flags.join(',') || '(none)'}, expected ${want.join(',')}`
  }
  return null
}

interface HardModeOptions {
  /** Turns hard mode on for the test. Unset: a normal test, untouched. */
  hardMode: HardModeRun | undefined
  /** The seed for tests that don't pin one. Flake Score sets it per project. */
  hardSeed: number
}

interface HardModeFixtures {
  hardModeJournal: HardModeJournal
}

export const test = base.extend<HardModeFixtures & HardModeOptions>({
  hardMode: [undefined, { option: true }],
  hardSeed: [SEED_MIN, { option: true }],

  hardModeJournal: [
    async ({ context, hardMode, hardSeed }, use, testInfo) => {
      const journal: HardModeJournal = { events: [], mismatches: [] }
      if (!hardMode) {
        await use(journal)
        return
      }

      const seed = hardMode.seed ?? hardSeed
      const flags = parseFlags(hardMode.flags)
      if (flags.length === 0) {
        throw new Error(`hardMode.flags: no known flag or set in "${hardMode.flags}"`)
      }
      if (!isSeed(seed)) throw new Error(`hard mode seed must be 1–10, got ${seed}`)
      const expected: Expected = { seed, flags }

      // Before any page script runs, and only once per context: later loads
      // keep whatever the test itself did to the config.
      await context.addInitScript(
        ({ key, value, applied }) => {
          try {
            if (localStorage.getItem(applied) !== null) return
            localStorage.setItem(key, value)
            localStorage.setItem(applied, '1')
          } catch {
            // Opaque origins (about:blank, some iframes) have no storage.
          }
        },
        { key: HARD_MODE_STORAGE_KEY, value: storedConfig(flags, seed), applied: APPLIED_KEY },
      )

      const started = Date.now()
      let pages = 0
      const watch = (page: Page) => {
        const index = pages++
        page.on('console', (msg) => {
          const event = parseEvent(msg.text())
          if (!event) return
          journal.events.push({ ...event, page: index, at: Date.now() - started })
          // The app emits `config` on every boot and every change, so each
          // page load is checked, whatever the test did to get there.
          if (event.type === 'config') {
            const problem = describeMismatch(expected, event.data)
            if (problem) journal.mismatches.push(`page ${index}: ${problem}`)
          }
        })
      }
      context.pages().forEach(watch)
      context.on('page', watch)

      await use(journal)

      testInfo.annotations.push({
        type: 'hard-mode',
        description: `flags=${hardMode.flags} seed=${seed} replay=${replayUrl(hardMode.flags, seed)}`,
      })
      for (const problem of journal.mismatches) {
        testInfo.annotations.push({ type: 'hard-mode-mismatch', description: problem })
      }
      if (testInfo.status !== testInfo.expectedStatus && journal.events.length > 0) {
        await testInfo.attach('hard-mode-events.json', {
          body: JSON.stringify(journal.events, null, 2),
          contentType: 'application/json',
        })
      }
    },
    { auto: true },
  ],
})

export { expect }
