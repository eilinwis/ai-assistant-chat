import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from '../types/Message'
import {
  clearStoredExchanges,
  dateKeyFromIso,
  exchangesFromApiMessages,
  loadExchanges,
  upsertExchanges,
} from './chatHistoryStorage'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear = () => this.store.clear()
  getItem = (key: string) => this.store.get(key) ?? null
  key = (index: number) => [...this.store.keys()][index] ?? null
  removeItem = (key: string) => void this.store.delete(key)
  setItem = (key: string, value: string) => void this.store.set(key, value)
}

vi.stubGlobal('localStorage', new MemoryStorage())

beforeEach(() => {
  clearStoredExchanges()
})

describe('dateKeyFromIso', () => {
  it('formats a valid ISO timestamp as YYYY-MM-DD', () => {
    expect(dateKeyFromIso('2026-08-15T09:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns "invalid" for an unparseable timestamp', () => {
    expect(dateKeyFromIso('not a date')).toBe('invalid')
  })
})

describe('exchangesFromApiMessages', () => {
  const user = (id: string, content: string): Message => ({
    id,
    role: 'user',
    content,
    timestamp: '2026-08-15T09:00:00.000Z',
  })
  const assistant = (id: string, content: string): Message => ({
    id,
    role: 'assistant',
    content,
    timestamp: '2026-08-15T09:00:01.000Z',
  })

  it('pairs each user message with the assistant reply right after it', () => {
    const exchanges = exchangesFromApiMessages([
      user('u1', 'hi'),
      assistant('a1', 'hello'),
      user('u2', 'bye'),
      assistant('a2', 'goodbye'),
    ])

    expect(exchanges).toHaveLength(2)
    expect(exchanges[0]).toMatchObject({ userContent: 'hi', assistantContent: 'hello' })
    expect(exchanges[1]).toMatchObject({ userContent: 'bye', assistantContent: 'goodbye' })
  })

  it('drops a trailing user message that has no assistant reply yet', () => {
    const exchanges = exchangesFromApiMessages([user('u1', 'hi'), assistant('a1', 'hello'), user('u2', 'still waiting')])

    expect(exchanges).toHaveLength(1)
    expect(exchanges[0].userContent).toBe('hi')
  })
})

describe('upsertExchanges', () => {
  const makeExchange = (id: string, userContent: string) => ({
    id,
    userContent,
    assistantContent: 'reply',
    userTimestamp: '2026-08-15T09:00:00.000Z',
    assistantTimestamp: '2026-08-15T09:00:01.000Z',
  })

  it('persists new exchanges so they can be loaded back', () => {
    upsertExchanges([makeExchange('e1', 'first')])

    expect(loadExchanges()).toEqual([makeExchange('e1', 'first')])
  })

  it('skips an exchange whose id was already stored', () => {
    upsertExchanges([makeExchange('e1', 'first')])
    upsertExchanges([makeExchange('e1', 'first (resent with the same id)')])

    expect(loadExchanges()).toHaveLength(1)
    expect(loadExchanges()[0].userContent).toBe('first')
  })
})
