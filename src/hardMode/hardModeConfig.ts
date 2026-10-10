export const HARD_MODE_FLAGS = [
  {
    id: 'popups',
    label: 'Blocking popups',
    hint: 'Cookie banner, a recurring promo modal (each gap doubles, up to 20 s), confirm() on Reset',
  },
  { id: 'latency', label: 'Latency', hint: 'Replies take 0.1–4 s' },
  {
    id: 'flaky-network',
    label: 'Flaky network',
    hint: 'Some sends fail; the message is marked undelivered until Retry',
  },
  {
    id: 'rate-limit',
    label: 'Rate limit',
    hint: 'More than 3 sends in 10 s starts a cooldown',
  },
  { id: 'toasts', label: 'Toasts', hint: 'Confirmations that vanish after 1.5 s' },
  {
    id: 'unstable-dom',
    label: 'Unstable DOM',
    hint: 'History re-mounts every 3 s; search results come back shuffled',
  },
  { id: 'no-testids', label: 'No test ids', hint: 'data-testid attributes are removed' },
  {
    id: 'moving-target',
    label: 'Moving target',
    hint: 'Send slides in when enabled; a tip covers it until dismissed',
  },
  {
    id: 'iframe-widget',
    label: 'Support iframe',
    hint: 'A support form (with its own popup) inside an iframe',
  },
  { id: 'shadow-dom', label: 'Shadow DOM widget', hint: 'Feedback widget in a shadow root' },
  { id: 'files', label: 'Files', hint: 'Attach a file to a message; export history as JSON' },
  {
    id: 'multi-tab',
    label: 'Multi-tab',
    hint: 'Open history in a new window; history syncs between tabs',
  },
  {
    id: 'slow-history',
    label: 'Slow history',
    hint: 'History loads behind skeletons and pages in on scroll',
  },
  { id: 'time', label: 'Relative time', hint: '"2 minutes ago" stamps and day dividers' },
  { id: 'clipboard', label: 'Clipboard', hint: 'Copy button on assistant replies' },
] as const

export type HardModeFlag = (typeof HARD_MODE_FLAGS)[number]['id']

export const ALL_FLAGS: readonly HardModeFlag[] = HARD_MODE_FLAGS.map((f) => f.id)

/**
 * Themed flag sets, usable wherever a flag is (`?hard=bad-network&seed=4`).
 * A set's contents never change once published — tests written against it
 * must keep meaning the same thing. A new flag goes into a new set; `all`
 * is the only name whose contents grow.
 */
export const HARD_MODE_SETS = [
  {
    id: 'bad-network',
    label: 'Bad network',
    flags: ['latency', 'flaky-network', 'rate-limit', 'slow-history', 'toasts'],
  },
  {
    id: 'tricky-dom',
    label: 'Tricky DOM',
    flags: ['unstable-dom', 'no-testids', 'moving-target', 'iframe-widget', 'shadow-dom'],
  },
] as const satisfies readonly { id: string; label: string; flags: readonly HardModeFlag[] }[]

export type HardModeSet = (typeof HARD_MODE_SETS)[number]['id']

export function findSet(name: string): (typeof HARD_MODE_SETS)[number] | undefined {
  return HARD_MODE_SETS.find((set) => set.id === name)
}

export interface HardModeConfig {
  enabled: boolean
  /** Kept while disabled too, so switching back on restores the selection. */
  flags: HardModeFlag[]
  seed: number
}

/**
 * Seeds are 1–10: ten scenarios per flag set, few enough that Flake Score
 * runs every one of them and a failing seed is easy to name and replay.
 */
export const SEED_MIN = 1
export const SEED_MAX = 10
export const ALL_SEEDS: readonly number[] = Array.from(
  { length: SEED_MAX - SEED_MIN + 1 },
  (_, i) => SEED_MIN + i,
)

export const HARD_MODE_OFF: HardModeConfig = { enabled: false, flags: [], seed: SEED_MIN }

export const STORAGE_KEY = 'chat-lab:hard-mode'

const OFF_VALUES = new Set(['', '0', 'off', 'none', 'false'])
const ALL_VALUES = new Set(['1', 'on', 'all', 'true'])

function isFlag(value: string): value is HardModeFlag {
  return (ALL_FLAGS as readonly string[]).includes(value)
}

/**
 * `all`/`1`/`on` → every flag; otherwise a comma list of flags and set names
 * (sets expand to their flags), unknown names dropped.
 */
export function parseFlags(raw: string): HardModeFlag[] {
  const value = raw.trim().toLowerCase()
  if (ALL_VALUES.has(value)) return [...ALL_FLAGS]
  const flags = value
    .split(',')
    .map((s) => s.trim())
    .flatMap((name): readonly string[] => findSet(name)?.flags ?? [name])
    .filter(isFlag)
  return [...new Set(flags)]
}

export function isSeed(value: number): boolean {
  return Number.isInteger(value) && value >= SEED_MIN && value <= SEED_MAX
}

/** A seed typed in by hand (the ⚙ panel): 1–10 exactly, anything else → null. */
export function parseSeed(raw: string | null): number | null {
  if (raw === null || !/^\d{1,2}$/.test(raw.trim())) return null
  const seed = Number(raw.trim())
  return isSeed(seed) ? seed : null
}

/**
 * A seed from a URL or from storage. Seeds used to go up to 999 999 999, and
 * old links and saved configs still carry them: fold those into 1–10 (42 → 2,
 * 0 → 10) rather than drop them, so they keep working, if as another scenario.
 */
export function coerceSeed(raw: string | null): number | null {
  if (raw === null || !/^\d{1,9}$/.test(raw.trim())) return null
  const seed = Number(raw.trim())
  return isSeed(seed) ? seed : seed % SEED_MAX || SEED_MAX
}

export function parseStored(raw: string | null): HardModeConfig | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<HardModeConfig>
    if (typeof data !== 'object' || data === null) return null
    const seed = coerceSeed(String(data.seed ?? ''))
    if (seed === null) return null
    const flags = Array.isArray(data.flags)
      ? data.flags.filter((f): f is HardModeFlag => typeof f === 'string' && isFlag(f))
      : []
    return { enabled: data.enabled === true, flags, seed }
  } catch {
    return null
  }
}

/**
 * Precedence: `?hard=` in the URL, then what's stored, then off.
 * Nothing but an explicit `?hard=` or a stored `enabled: true` turns it on —
 * a bare `?seed=` never does.
 */
export function resolveConfig(
  search: string,
  stored: string | null,
  makeSeed: () => number,
): HardModeConfig {
  const params = new URLSearchParams(search)
  const hard = params.get('hard')
  const urlSeed = coerceSeed(params.get('seed'))
  const base = parseStored(stored)

  if (hard !== null) {
    const flags = OFF_VALUES.has(hard.trim().toLowerCase()) ? [] : parseFlags(hard)
    const seed = urlSeed ?? base?.seed ?? makeSeed()
    if (flags.length === 0) {
      return { enabled: false, flags: base?.flags ?? [], seed }
    }
    return { enabled: true, flags, seed }
  }

  if (base) {
    return { ...base, seed: urlSeed ?? base.seed }
  }
  return { ...HARD_MODE_OFF }
}

export function randomSeed(): number {
  return SEED_MIN + Math.floor(Math.random() * ALL_SEEDS.length)
}
