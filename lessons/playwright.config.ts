import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/**
 * Standalone config for the /lessons course, separate from the project's
 * own e2e/ config. Lessons test this app itself (the "AI Assistant Chat"
 * demo), so this config points at it directly and starts the dev server
 * for you.
 */
export default defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // See Lesson 11: retry only in CI, where a failure is more likely to be a
  // real, environment-specific flake than something to fix and re-run by
  // hand — locally, a clean single failure is more useful than a masked one.
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    cwd: projectRoot,
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: !!process.env.CI },
    },
  ],
})
