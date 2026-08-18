import { test as base, expect } from '@playwright/test'

// Screens under test: Chat ("/") and Message history ("/history") — the
// same screens Lessons 1–3 already used. This lesson isn't about new screen
// behavior; it's about organizing tests that already know how to do these
// things, using hooks and fixtures instead of a hand-rolled helper function
// called manually in every test.

interface Fixtures {
  sendMessage: (text: string) => Promise<void>
  failOnPageErrors: void
}

// test.extend() layers new fixtures on top of Playwright's built-in ones
// (page, context, browser, ...). A fixture's setup runs lazily — right
// before a test (or a beforeEach) first requests it — and its teardown (the
// code after `use()`) runs after the test finishes, pass or fail. `test`
// below shadows the import from '@playwright/test' for the rest of the file.
const test = base.extend<Fixtures>({
  sendMessage: async ({ page }, use) => {
    async function send(text: string) {
      const chatInput = page.getByTestId('chat-input')
      const sendButton = page.getByTestId('send-button')
      await expect(chatInput).toBeEnabled({ timeout: 15_000 })
      await chatInput.fill(text)
      await sendButton.click()
      await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    }
    await use(send) // hand the finished helper to whichever test asked for it
  },

  // { auto: true } fixtures run for every test in the file automatically —
  // no test needs to name them in its argument list. This one has no useful
  // "value"; it exists purely for its teardown, asserting that nothing threw
  // an uncaught exception while the test ran.
  failOnPageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await use()

      expect(errors, `Uncaught exception(s) during the test:\n${errors.join('\n')}`).toEqual([])
    },
    { auto: true },
  ],
})

test.describe('Lesson 6: Hooks & fixtures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ page }, testInfo) => {
    // Every hook (and test) receives testInfo as a second argument, with
    // details like the title and outcome — a common real use of afterEach
    // is capturing extra evidence only when something actually went wrong.
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: `test-results/failure-${testInfo.title}.png` })
    }
  })

  test('the sendMessage fixture replaces a hand-written helper function', async ({ sendMessage, page }) => {
    await sendMessage('Bananas are great')
    await expect(page.getByTestId('message-user').last()).toHaveText('Bananas are great')
  })

  test('a fixture composes with plain page actions in the same test', async ({ sendMessage, page }) => {
    await sendMessage('Ducks like bread')
    await sendMessage('Programmers unite')

    await page.getByTestId('nav-tab-history').click()
    await expect(page).toHaveURL(/\/history$/)
    await expect(page.locator('li.history-day__item')).toHaveCount(2)
  })

  test.describe('with two messages already sent', () => {
    // Nested describes compose their hooks outer-to-inner: this beforeEach
    // runs after the outer one above (which already navigated to "/").
    test.beforeEach(async ({ sendMessage, page }) => {
      await sendMessage('Gravity always wins')
      await sendMessage('How odd')
      await page.getByTestId('nav-tab-history').click()
      await expect(page).toHaveURL(/\/history$/)
    })

    test('both messages show up grouped under today, and delete is enabled', async ({ page }) => {
      await expect(page.locator('li.history-day__item')).toHaveCount(2)
      
      await expect(page.getByTestId('delete-history-button')).toBeEnabled()
    })

    test('a message sent earlier in beforeEach can still be found via search', async ({ page }) => {
      await page.getByTestId('nav-tab-search').click()
      await page.getByPlaceholder('Type words from a message…').fill('Gravity')
      await expect(page.locator('li.search-results__item')).toHaveCount(1)
    })
  })
})
