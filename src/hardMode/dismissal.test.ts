import { afterEach, describe, expect, it, vi } from 'vitest'
import { DISMISSAL_KEYS, readDismissal, writeDismissal } from './dismissal'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe('dismissal', () => {
  it('keeps the consent key name tests already depend on', () => {
    expect(DISMISSAL_KEYS.consent).toBe('chat-lab:hard-mode:consent')
  })

  it('reads back what was written, per scope', () => {
    expect(readDismissal(DISMISSAL_KEYS.consent)).toBeNull()

    writeDismissal(DISMISSAL_KEYS.consent, 'accepted')
    expect(readDismissal(DISMISSAL_KEYS.consent)).toBe('accepted')
    expect(localStorage.getItem('chat-lab:hard-mode:consent')).toBe('accepted')
    expect(readDismissal(DISMISSAL_KEYS.consent, 'session')).toBeNull()

    writeDismissal(DISMISSAL_KEYS.consent, 'rejected', 'session')
    expect(sessionStorage.getItem('chat-lab:hard-mode:consent')).toBe('rejected')
  })

  it('treats unavailable storage as "not dismissed" instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => writeDismissal(DISMISSAL_KEYS.consent, 'accepted')).not.toThrow()
    expect(readDismissal(DISMISSAL_KEYS.consent)).toBeNull()
  })
})
