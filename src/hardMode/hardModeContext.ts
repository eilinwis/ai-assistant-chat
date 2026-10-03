import { createContext } from 'react'
import { HARD_MODE_OFF, type HardModeConfig, type HardModeFlag } from './hardModeConfig'
import { createRuntime, type HardModeRuntime } from './withHardMode'

export interface Toast {
  id: number
  text: string
}

export interface HardModeContextValue {
  config: HardModeConfig
  isOn: (flag: HardModeFlag) => boolean
  /** Keyed draw in [0, 1) for the current seed — see rng.ts. */
  rand: (...keys: (string | number)[]) => number
  setConfig: (config: HardModeConfig) => void
  runtime: HardModeRuntime
  toasts: Toast[]
  /** No-op unless the `toasts` flag is on. */
  toast: (text: string) => void
}

// Outside a provider (unit tests render ChatWindow bare) everything is off.
export const HardModeContext = createContext<HardModeContextValue>({
  config: HARD_MODE_OFF,
  isOn: () => false,
  rand: () => 0,
  setConfig: () => undefined,
  runtime: createRuntime(),
  toasts: [],
  toast: () => undefined,
})
