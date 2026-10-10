import { test as base, expect, type Page } from '@playwright/test'
import { STORAGE_KEY } from '../../src/hardMode/hardModeConfig'
import { parseEvent, type EventData, type HardModeEvent } from '../../src/hardMode/telemetry'

/**
 * Optional fixture for running tests under hard mode. Import `test` and
 * `expect` from here instead of '@playwright/test' and you get, on top of
 * plain Playwright:
 *
 * - a journal of every hard-mode event (promo shown, request failed, …) from
 *   every page of the test's context, attached to the report when a test
 *   fails;
 * - with the `hardMode` option set, a check that the app really ran with
 *   that seed and those flags. A test that opens `/?hard=off` (the URL beats
 *   stored config) is recorded in `hardModeJournal.mismatches` and as a
 *   `hard-mode-mismatch` annotation, instead of passing as if it had coped.
 *
 * The fixture never turns hard mode on by itself: deliver the config with
 * `storageState: hardModeStorageState(...)` next to the option — that works
 * for tests that don't import this file, too.
 */

export interface ExpectedHardMode {
  seed: number
  flags: string[]
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

/** A storageState that boots the app at `origin` with this hard mode config. */
export function hardModeStorageState(origin: string, expected: ExpectedHardMode) {
  const config = { enabled: true, flags: expected.flags, seed: expected.seed }
  return {
    cookies: [],
    origins: [
      { origin, localStorage: [{ name: STORAGE_KEY, value: JSON.stringify(config) }] },
    ],
  }
}

/** The URL that replays a hard mode run by hand. */
export function replayUrl(expected: ExpectedHardMode): string {
  return `/?hard=${expected.flags.join(',')}&seed=${expected.seed}`
}

/** Why a `config` event doesn't match what was expected, or null if it does. */
export function describeMismatch(expected: ExpectedHardMode, actual: EventData): string | null {
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
  /** What the run is supposed to use; undefined → nothing is checked. */
  hardMode: ExpectedHardMode | undefined
}

interface HardModeFixtures {
  hardModeJournal: HardModeJournal
}

export const test = base.extend<HardModeFixtures & HardModeOptions>({
  hardMode: [undefined, { option: true }],

  hardModeJournal: [
    async ({ context, hardMode }, use, testInfo) => {
      const journal: HardModeJournal = { events: [], mismatches: [] }
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
          if (event.type === 'config' && hardMode) {
            const problem = describeMismatch(hardMode, event.data)
            if (problem) journal.mismatches.push(`page ${index}: ${problem}`)
          }
        })
      }
      context.pages().forEach(watch)
      context.on('page', watch)

      await use(journal)

      if (hardMode) {
        testInfo.annotations.push({
          type: 'hard-mode',
          description: `seed=${hardMode.seed} flags=${hardMode.flags.join(',')} replay=${replayUrl(hardMode)}`,
        })
        for (const problem of journal.mismatches) {
          testInfo.annotations.push({ type: 'hard-mode-mismatch', description: problem })
        }
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
