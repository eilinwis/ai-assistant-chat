import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getReply, type GetReply } from '../lib/replyService'
import { HardModeContext, type HardModeContextValue } from './hardModeContext'
import { withHardMode } from './withHardMode'

export function useHardMode(): HardModeContextValue {
  return useContext(HardModeContext)
}

/**
 * `{...tid('send-button')}` instead of a literal `data-testid`, so the
 * `no-testids` flag can strip them.
 */
export function useTid(): (id: string) => { 'data-testid'?: string } {
  const { isOn } = useHardMode()
  const hide = isOn('no-testids')
  return useCallback((id: string) => (hide ? {} : { 'data-testid': id }), [hide])
}

/** The reply source, wrapped with whichever network-shaped flags are on. */
export function useReplyService(): GetReply {
  const { isOn, rand, runtime } = useHardMode()
  return useMemo(() => withHardMode(getReply, { isOn, rand, runtime }), [isOn, rand, runtime])
}

/** Current time, re-read every `intervalMs` while `active`. */
export function useNow(active: boolean, intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
  return now
}
