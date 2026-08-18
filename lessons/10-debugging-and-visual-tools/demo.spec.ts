import fs from 'node:fs'
import { test, expect, type Page } from '@playwright/test'

// Screen under test: Chat ("/"). This lesson isn't about the screen at
// all — it's about the evidence Playwright can capture *while* a test
// runs, so you (or a teammate looking at a CI failure) can see what
// actually happened.

async function readVideoPath(page: Page): Promise<string> {
  const video = page.video()
  if (!video) {
    throw new Error('Expected recordVideo to attach a video to the page')
  }
  return video.path()
}

test.describe('Lesson 10: Debugging & visual tools', () => {
  test('context.tracing.start()/stop() produces a trace you can open with npx playwright show-trace', async ({
    page,
    context,
  }, testInfo) => {
    // `trace: 'on-first-retry'` in this config already does this
    // automatically on a retried test. Calling it yourself, mid-test, is
    // useful when you want a trace around one specific risky stretch of a
    // test, not the whole run.
    await context.tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('chat-input').fill('Hello there!')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').first()).toBeVisible()

    // testInfo.outputPath() gives every test its own directory under
    // test-results/ — no risk of two tests colliding on the same filename.
    const tracePath = testInfo.outputPath('trace.zip')
    await context.tracing.stop({ path: tracePath })

    expect(fs.existsSync(tracePath)).toBe(true)
  })

  test('page.screenshot() and locator.screenshot() save images you can inspect after a run', async ({
    page,
  }, testInfo) => {
    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })

    const fullPagePath = testInfo.outputPath('full-page.png')
    await page.screenshot({ path: fullPagePath })
    expect(fs.existsSync(fullPagePath)).toBe(true)

    // A locator screenshot crops to just that element — handy for a visual
    // check on one widget without the rest of the page as noise.
    const inputPath = testInfo.outputPath('chat-input.png')
    await page.getByTestId('chat-input').screenshot({ path: inputPath })
    expect(fs.existsSync(inputPath)).toBe(true)
  })

  test('a context created with recordVideo saves a .webm once the context closes', async ({
    browser,
  }, testInfo) => {
    // Video, unlike tracing, can't be toggled mid-test — it's set when the
    // context is created. A fresh context here (see Lesson 8) is how you
    // record just this one test without turning video on for the whole run.
    const recordingContext = await browser.newContext({
      recordVideo: { dir: testInfo.outputPath('videos') },
    })
    const recordingPage = await recordingContext.newPage()

    await recordingPage.goto('/')
    await expect(recordingPage.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await recordingPage.getByTestId('chat-input').fill('Hello there!')
    await recordingPage.getByTestId('send-button').click()
    await expect(recordingPage.getByTestId('message-assistant').first()).toBeVisible()

    // The .webm file only finishes writing once its page (and context)
    // close — reading the path any earlier would race the encoder.
    await recordingContext.close()

    const videoPath = await readVideoPath(recordingPage)
    expect(fs.existsSync(videoPath)).toBe(true)
  })
})
