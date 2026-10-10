import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  randomSeed,
  resolveConfig,
  STORAGE_KEY,
  type HardModeConfig,
  type HardModeFlag,
} from './hardModeConfig'
import { HardModeContext, type Toast } from './hardModeContext'
import { rand as keyedRand } from './rng'
import { emitEvent, publishConfig } from './telemetry'
import { createRuntime } from './withHardMode'

const TOAST_MS = 1500

function readInitialConfig(): HardModeConfig {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    void 0
  }
  return resolveConfig(window.location.search, stored, randomSeed)
}

export function HardModeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HardModeConfig>(readInitialConfig)
  // Mutable counters shared by every send on this page load; never re-created.
  const [runtime] = useState(createRuntime)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextToastId = useRef(0)

  // Persist whatever was resolved, including a `?hard=` from the URL, so
  // client-side navigation (which drops the query string) keeps the mode.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      void 0
    }
    if (config.enabled) {
      console.info(
        `[hard mode] seed=${config.seed} flags=${config.flags.join(',')}`,
      )
    }
    // On every page load and every change, enabled or not — a test fixture
    // compares this against the config it expected (e2e/hard-mode/test.ts).
    publishConfig(config)
    emitEvent('config', { enabled: config.enabled, seed: config.seed, flags: config.flags })
  }, [config])

  const isOn = useCallback(
    (flag: HardModeFlag) => config.enabled && config.flags.includes(flag),
    [config],
  )

  const rand = useCallback(
    (...keys: (string | number)[]) => keyedRand(config.seed, ...keys),
    [config.seed],
  )

  const toastsOn = isOn('toasts')
  const toast = useCallback(
    (text: string) => {
      if (!toastsOn) return
      const id = nextToastId.current++
      emitEvent('toasts:shown', { text })
      setToasts((prev) => [...prev, { id, text }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, TOAST_MS)
    },
    [toastsOn],
  )

  const value = useMemo(
    () => ({
      config,
      isOn,
      rand,
      setConfig,
      runtime,
      toasts,
      toast,
      emit: emitEvent,
    }),
    [config, isOn, rand, runtime, toasts, toast],
  )

  return <HardModeContext.Provider value={value}>{children}</HardModeContext.Provider>
}
