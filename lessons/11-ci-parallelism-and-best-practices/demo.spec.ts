import { test, expect } from '@playwright/test'

// Screen under test: Chat ("/"), same as Lesson 1 — this lesson isn't about
// new screen behavior, it's about how tests behave as a *suite*: under
// retries, run in parallel, and read afterward in a report.

test.describe('Lesson 11: CI, parallelism & best practices', () => {
  test.describe('a deliberately flaky test, rescued by retries', () => {
    // Overrides this describe block's retry count regardless of what the
    // config file says — useful for isolating "does retrying actually fix
    // this" without changing global behavior for every other test.
    test.describe.configure({ retries: 2 })

    test('fails on its first attempt, passes once retried', async ({}, testInfo) => {
      // testInfo.retry is 0 on the first attempt, 1 on the first retry, etc.
      // This is the textbook shape of a synthetic flake — real flakiness
      // (a race condition, a timing assumption) fails unpredictably instead
      // of on a fixed schedule, but the effect on the report is the same:
      // "failed, then passed" instead of a clean single pass.
      //
      // eslint-plugin-playwright's no-conditional-in-test rule warns on the
      // `if` below for good reason — a conditional in a test usually means
      // the test's own logic, not just the app, decides what gets checked.
      // This is the one deliberate exception: branching on the *attempt
      // number* to simulate a flake on purpose, which is the entire point
      // of this test.
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (testInfo.retry === 0) {
        throw new Error('Simulated flake — only fails on the very first attempt.')
      }
      expect(testInfo.retry).toBeGreaterThan(0)
    })
  })

  test('test.step() groups related actions into one labeled, collapsible entry', async ({ page }) => {
    // Every step below shows up as its own named row in the HTML report and
    // the trace viewer (Lesson 10) — instead of one long list of raw
    // actions, a failure points straight at "send a message" or "see the
    // reply," not line 47.
    await test.step('open the chat screen', async () => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    })

    await test.step('send a message', async () => {
      await page.getByTestId('chat-input').fill('Hello there!')
      await page.getByTestId('send-button').click()
    })

    await test.step('see the reply', async () => {
      await expect(page.getByTestId('message-assistant').first()).toBeVisible()
    })
  })

  test.describe('two tests that share no state — safe to run on any worker, in any order', () => {
    // Neither test reads anything the other one wrote. Each gets its own
    // fresh page and browser context by default (Lesson 8), so nothing here
    // depends on which one runs first, or whether they run on the same
    // worker at all — the property that makes `--workers > 1` (or splitting
    // a suite across CI machines with `--shard`) safe in the first place.

    test('sending "Bananas are great" only asserts on its own message', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Bananas are great')
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-user').last()).toHaveText('Bananas are great')
    })

    test('sending "Historians unite" only asserts on its own message', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Historians unite')
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-user').last()).toHaveText('Historians unite')
    })
  })
})
