import type { Message } from '../types/Message'
import type { ChatExchange } from '../types/ChatExchange'

const STORAGE_KEY = 'ai-assistant-chat-history-v1'

function readRaw(): ChatExchange[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isExchange)
  } catch {
    return []
  }
}

function isExchange(value: unknown): value is ChatExchange {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  if (
    o.assistantImageSrc !== undefined &&
    typeof o.assistantImageSrc !== 'string'
  ) {
    return false
  }
  return (
    typeof o.id === 'string' &&
    typeof o.userContent === 'string' &&
    typeof o.assistantContent === 'string' &&
    typeof o.userTimestamp === 'string' &&
    typeof o.assistantTimestamp === 'string'
  )
}

export function loadExchanges(): ChatExchange[] {
  return readRaw()
}

export function saveExchanges(exchanges: ChatExchange[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exchanges))
}

export function clearStoredExchanges(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function exchangeFingerprint(e: ChatExchange): string {
  return `${e.userContent.trim()}\x00${e.assistantContent.trim()}\x00${e.assistantTimestamp}\x00${e.assistantImageSrc ?? ''}`
}

export function upsertExchanges(newOnes: ChatExchange[]): void {
  if (newOnes.length === 0) return
  const all = loadExchanges()
  const seenIds = new Set(all.map((e) => e.id))
  const seenPrints = new Set(all.map(exchangeFingerprint))
  const toAdd = newOnes.filter((e) => {
    if (seenIds.has(e.id)) return false
    const fp = exchangeFingerprint(e)
    if (seenPrints.has(fp)) return false
    seenIds.add(e.id)
    seenPrints.add(fp)
    return true
  })
  if (toAdd.length === 0) return
  saveExchanges([...all, ...toAdd])
}

export function exchangesFromApiMessages(messages: Message[]): ChatExchange[] {
  const out: ChatExchange[] = []
  for (let i = 0; i < messages.length - 1; i++) {
    const a = messages[i]
    const b = messages[i + 1]
    if (a.role === 'user' && b.role === 'assistant') {
      out.push({
        id: `api-${a.id}-${b.id}`,
        userContent: a.content,
        assistantContent: b.content,
        userTimestamp: a.timestamp,
        assistantTimestamp: b.timestamp,
        assistantImageSrc: b.imageSrc,
      })
      i++
    }
  }
  return out
}

export function dateKeyFromIso(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'invalid'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
