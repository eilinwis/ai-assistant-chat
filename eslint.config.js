import js from '@eslint/js'
import globals from 'globals'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const PLAYWRIGHT_FILES = ['e2e/**/*.{ts,tsx}', 'lessons/**/*.{ts,tsx}']

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Playwright test files, not React components/hooks — the react-hooks
    // rules don't apply here and produce false positives (e.g. a fixture's
    // `use` callback parameter reads as a call to the "use" hook).
    files: PLAYWRIGHT_FILES,
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      // Playwright's own docs type a value-less auto fixture's Fixtures
      // entry as `void` (see e.g. lessons/06-hooks-and-fixtures/demo.spec.ts's
      // failOnPageErrors) — that's the idiom, not a mistake.
      '@typescript-eslint/no-invalid-void-type': 'off',
      // e2e/'s page objects wrap assertions in helper methods named
      // expectXxx() (see e2e/pages/searchPage.ts, appLayoutPage.ts) — teach
      // the rule to look for those too, not just bare expect(...) calls.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect'] }],
    },
  },
  {
    // Every lessons/**/homework.spec.ts test starts as `test.fixme()` with
    // no body yet — that's the exercise, not a missing assertion.
    files: ['lessons/**/homework.spec.ts'],
    rules: {
      'playwright/expect-expect': 'off',
    },
  },
])
