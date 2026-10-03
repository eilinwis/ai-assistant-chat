import { describe, expect, it } from 'vitest'
import { dayLabel, formatRelative } from './relativeTime'

const now = new Date(2026, 9, 1, 12, 0, 0).getTime()
const ago = (ms: number) => new Date(now - ms).toISOString()

describe('formatRelative', () => {
  it.each([
    [10_000, 'just now'],
    [60_000, '1 minute ago'],
    [5 * 60_000, '5 minutes ago'],
    [2 * 3_600_000, '2 hours ago'],
    [3 * 86_400_000, '3 days ago'],
  ])('%i ms ago → %s', (ms, expected) => {
    expect(formatRelative(ago(ms), now)).toBe(expected)
  })
})

describe('dayLabel', () => {
  it('says Today / Yesterday / full date', () => {
    expect(dayLabel(ago(60_000), now)).toBe('Today')
    expect(dayLabel(new Date(2026, 8, 30, 23, 0).toISOString(), now)).toBe('Yesterday')
    expect(dayLabel(new Date(2026, 8, 20).toISOString(), now)).toMatch(/September 20, 2026/)
  })
})
