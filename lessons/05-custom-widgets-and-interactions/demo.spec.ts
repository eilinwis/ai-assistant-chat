import { test, expect } from '@playwright/test'

// Screen under test: Playground ("/playground") — hand-built widgets that
// don't behave like plain text inputs: drag-and-drop, a range slider,
// toggle buttons, a video player, and a modal.

test.describe('Lesson 5: Custom widgets & complex interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground')
  })

  test('dragging an item from the source list into the dropzone moves it', async ({ page }) => {
    const apple = page.getByTestId('dnd-item-apple')
    const resetButton = page.getByTestId('dnd-reset')

    await expect(resetButton).toBeDisabled() // nothing dropped yet

    await apple.dragTo(page.getByTestId('dnd-dropzone'))

    await expect(page.getByTestId('dnd-dropped-apple')).toBeVisible()
    // `apple` still points at the same data-testid — it now matches nothing,
    // because the element was removed from the source list, not moved in place.
    await expect(apple).toHaveCount(0)
    await expect(resetButton).toBeEnabled()

    await resetButton.click()
    await expect(page.getByTestId('dnd-dropped-apple')).toHaveCount(0)
    await expect(page.getByTestId('dnd-item-apple')).toBeVisible() // back in the source list
  })

  test('the volume slider responds to fill() and to real key presses', async ({ page }) => {
    const slider = page.getByTestId('volume-slider')
    await expect(slider).toHaveValue('50') // the default volume

    await slider.fill('80')
    await expect(slider).toHaveValue('80')

    // fill() sets the value directly. Arrow keys exercise the browser's own
    // range-input keyboard handling instead — a different code path, and
    // one that only works once the element is actually focused.
    await slider.focus()
    await slider.press('ArrowLeft')
    await slider.press('ArrowLeft')
    await expect(slider).toHaveValue('78')

    await page.getByTestId('volume-reset').click()
    await expect(slider).toHaveValue('50')
  })

  test('gallery thumbnails track the active image via aria-pressed', async ({ page }) => {
    const mainImage = page.getByTestId('gallery-main-image')
    const heroThumb = page.getByTestId('gallery-thumb-hero')
    const reactThumb = page.getByTestId('gallery-thumb-react')

    await expect(heroThumb).toHaveAttribute('aria-pressed', 'true') // first image, active by default
    await expect(reactThumb).toHaveAttribute('aria-pressed', 'false')

    await reactThumb.click()

    await expect(reactThumb).toHaveAttribute('aria-pressed', 'true')
    await expect(heroThumb).toHaveAttribute('aria-pressed', 'false')
    await expect(mainImage).toHaveAttribute('alt', 'React logo')
    await expect(page.getByTestId('gallery-caption')).toHaveText('React logo')
  })

  test('video play/mute buttons toggle their own label and aria-pressed state', async ({ page }) => {
    const playButton = page.getByTestId('video-play-button')
    const muteButton = page.getByTestId('video-mute-button')

    // Muted by default (autoplay policies generally require it); not playing yet.
    await expect(playButton).toHaveText('Play')
    await expect(playButton).toHaveAttribute('aria-pressed', 'false')
    await expect(muteButton).toHaveText('Unmute')
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true')

    await playButton.click()
    await expect(playButton).toHaveText('Pause')
    await expect(playButton).toHaveAttribute('aria-pressed', 'true')

    await muteButton.click()
    await expect(muteButton).toHaveText('Mute')
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('the modal can be dismissed the same way via Cancel or a backdrop click', async ({ page }) => {
    const dialog = page.getByTestId('modal-dialog')

    await page.getByTestId('modal-open-button').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('modal-cancel-button').click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByTestId('modal-result')).toHaveText('Last action: cancelled')

    // A click that lands on the backdrop itself — not on the dialog it wraps
    // — closes the modal too, because the dialog stops the click from
    // bubbling up. Targeting a corner keeps the click off the centered dialog.
    await page.getByTestId('modal-open-button').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('modal-backdrop').click({ position: { x: 5, y: 5 } })
    await expect(dialog).not.toBeVisible()
    await expect(page.getByTestId('modal-result')).toHaveText('Last action: cancelled')
  })

  test('Escape closes the modal too, but — unlike Cancel — it never records a result', async ({ page }) => {
    // Don't assume Escape is "just another way to cancel" — check the app.
    // Its keydown handler only closes the dialog; it never calls the same
    // close() function Cancel/Confirm/backdrop-click do, so no outcome is
    // ever recorded for it.
    const dialog = page.getByTestId('modal-dialog')

    await page.getByTestId('modal-open-button').click()
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(dialog).not.toBeVisible()
    await expect(page.getByTestId('modal-result')).toHaveCount(0) // no "Last action" line at all
  })

  test('dragging every item out empties the source list, and reset restores all of them', async ({ page }) => {
    const dropzone = page.getByTestId('dnd-dropzone')

    await page.getByTestId('dnd-item-apple').dragTo(dropzone)
    await page.getByTestId('dnd-item-banana').dragTo(dropzone)
    await page.getByTestId('dnd-item-cherry').dragTo(dropzone)

    // With nothing left to drag, the source list swaps to its empty-state text.
    await expect(page.getByTestId('dnd-source')).toHaveText('All items dropped.')
    await expect(page.getByTestId('dnd-dropped-list').locator('li')).toHaveCount(3)

    await page.getByTestId('dnd-reset').click()

    await expect(page.getByTestId('dnd-item-apple')).toBeVisible()
    await expect(page.getByTestId('dnd-item-banana')).toBeVisible()
    await expect(page.getByTestId('dnd-item-cherry')).toBeVisible()
    await expect(page.getByTestId('dnd-dropped-list').locator('li')).toHaveCount(0)
  })
})
