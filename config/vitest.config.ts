import { defineConfig } from 'vitest/config'

// Kept out of vite.config.ts on purpose: vitest bundles its own copy of Vite,
// so a shared `defineConfig` there fails to type-check against the project's
// Vite. `npm run test` points at this file with --config; paths below stay
// relative to the repo root, which is where that command runs.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'config/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
