const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`
}

export function formatRelative(iso: string, now: number): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Math.max(0, now - t)
  if (diff < 45_000) return 'just now'
  if (diff < HOUR) return plural(Math.max(1, Math.round(diff / MINUTE)), 'minute')
  if (diff < DAY) return plural(Math.floor(diff / HOUR), 'hour')
  return plural(Math.floor(diff / DAY), 'day')
}

function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a).getTime()) === startOfDay(new Date(b).getTime())
}

/** "Today", "Yesterday", or the full date — in the browser's time zone. */
export function dayLabel(iso: string, now: number): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 'Unknown date'
  const days = Math.round((startOfDay(now) - startOfDay(t)) / DAY)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(t)
}
