import { expect, test } from 'playwright/test'
import { PageManager } from '../pages/pageManager'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173')
})

test.describe('Help', () => {
  test('spoilers start collapsed; opening one shows answer and Collapse', async ({
    page,
  }) => {
    const pageManager = new PageManager(page)
    const help = pageManager.onHelpPage()

    await pageManager.onAppLayout().goToHelpPage()
    await expect(help.details).not.toHaveAttribute('open')
    await expect(help.spoilerBody).toBeHidden()

    await help.openFailedAiResponseSpoiler()

    await expect(help.failedAiSpoiler).toHaveAttribute('open')
    await expect(
      help.failedAiSpoiler.getByText('The app could not reach', {
        exact: false,
      }),
    ).toBeVisible()
    await expect(
      help.failedAiTrigger.getByText('Expand', { exact: true }),
    ).toBeHidden()
    await expect(
      help.failedAiTrigger.getByText('Collapse', { exact: true }),
    ).toBeVisible()
  })
})
