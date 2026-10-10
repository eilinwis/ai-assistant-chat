import { expect, test } from './test'

// Reference tests for the hard mode plumbing every flag relies on: explicit
// opt-in, the `data-hard-mode` marker, the console event journal and the
// fixture's check that a run really used the config it asked for.

test.describe('without the hardMode option', () => {
  test('the app runs in normal mode and the fixture stays out of it', async ({
    page,
    hardModeJournal,
  }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('data-hard-mode', 'off')
    expect(hardModeJournal.events).toEqual([])
  })
})

test.describe('with the hardMode option', () => {
  test.use({ hardMode: { flags: 'toasts,latency', seed: 7 } })

  test('turns hard mode on and passes the fixture check', async ({ page, hardModeJournal }) => {
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

test.describe('with a set and no pinned seed', () => {
  test.use({ hardMode: { flags: 'bad-network' }, hardSeed: 3 })

  test("expands the set and takes the run's seed", async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute(
      'data-hard-mode',
      'seed=3;flags=flaky-network,latency,rate-limit,slow-history,toasts',
    )
  })
})

test.describe('a test that overrides its own config', () => {
  test.use({ hardMode: { flags: 'toasts', seed: 7 } })

  test('is recorded as a mismatch, not a pass', async ({ page, hardModeJournal }) => {
    // The URL beats stored config, so this page runs with hard mode off.
    await page.goto('/?hard=off')

    await expect(page.locator('html')).toHaveAttribute('data-hard-mode', 'off')
    await expect.poll(() => hardModeJournal.mismatches).toContain('page 0: hard mode is off')
  })
})

test.describe('event journal', () => {
  test.use({ hardMode: { flags: 'popups', seed: 4 } })

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
