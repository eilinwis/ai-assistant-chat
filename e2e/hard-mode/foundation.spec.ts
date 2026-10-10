import { expect, hardModeStorageState, test, type ExpectedHardMode } from './test'

// Reference tests for the hard mode plumbing every flag relies on: the
// `data-hard-mode` marker, the console event journal and the fixture's check
// that a run really used the config it was given.

const ORIGIN = 'http://localhost:5173'

function runWith(expected: ExpectedHardMode) {
  test.use({ hardMode: expected, storageState: hardModeStorageState(ORIGIN, expected) })
}

test.describe('config delivered through storageState', () => {
  runWith({ seed: 7, flags: ['toasts', 'latency'] })

  test('marks <html> and passes the fixture check', async ({ page, hardModeJournal }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute(
      'data-hard-mode',
      'seed=7;flags=latency,toasts',
    )
    await expect
      .poll(() => hardModeJournal.events.some((e) => e.type === 'config'))
      .toBe(true)
    expect(hardModeJournal.mismatches).toEqual([])
  })
})

test.describe('a test that overrides the config', () => {
  runWith({ seed: 7, flags: ['toasts'] })

  test('is recorded as a mismatch, not a pass', async ({ page, hardModeJournal }) => {
    // The URL beats stored config, so this page runs with hard mode off.
    await page.goto('/?hard=off')

    await expect(page.locator('html')).toHaveAttribute('data-hard-mode', 'off')
    await expect.poll(() => hardModeJournal.mismatches).toContain('page 0: hard mode is off')
  })
})

test.describe('event journal', () => {
  runWith({ seed: 42, flags: ['popups'] })

  test('collects overlay events and survives a reload', async ({ page, hardModeJournal }) => {
    const types = () => hardModeJournal.events.map((e) => e.type)

    await page.clock.install()
    await page.goto('/')
    await expect.poll(types).toContain('popups:cookie-shown')
    await page.getByRole('button', { name: 'Accept all' }).click()

    // The first promo shows 1–6 s after load (seed-determined).
    await page.clock.fastForward(7_000)
    await page.getByRole('button', { name: 'Maybe later' }).click()
    await expect.poll(types).toEqual(
      expect.arrayContaining([
        'popups:cookie-decided',
        'popups:promo-shown',
        'popups:promo-closed',
      ]),
    )

    const configsBefore = types().filter((t) => t === 'config').length
    await page.reload()
    await expect
      .poll(() => types().filter((t) => t === 'config').length)
      .toBeGreaterThan(configsBefore)
    expect(hardModeJournal.mismatches).toEqual([])
  })
})
