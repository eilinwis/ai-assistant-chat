import { useMemo, useState } from 'react'

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function EventCalendar() {
  const today = useMemo(() => new Date(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today))
  const [selected, setSelected] = useState<string | null>(null)

  const days = useMemo(() => {
    const first = startOfMonth(visibleMonth)
    const leadingBlanks = first.getDay()
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate()
    const cells: (Date | null)[] = Array(leadingBlanks).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      )
    }
    return cells
  }, [visibleMonth])

  const heading = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)

  const todayIso = toIsoDate(today)

  return (
    <div className="widget-calendar">
      <div className="widget-calendar__header">
        <button
          type="button"
          className="widget-calendar__nav"
          data-testid="calendar-prev"
          aria-label="Previous month"
          onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
        >
          ‹
        </button>
        <span
          className="widget-calendar__heading"
          data-testid="calendar-heading"
        >
          {heading}
        </span>
        <button
          type="button"
          className="widget-calendar__nav"
          data-testid="calendar-next"
          aria-label="Next month"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
        >
          ›
        </button>
      </div>
      <div className="widget-calendar__weekdays">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="widget-calendar__grid">
        {days.map((date, i) => {
          if (!date) {
            return <span key={`blank-${i}`} className="widget-calendar__day-blank" />
          }
          const iso = toIsoDate(date)
          return (
            <button
              key={iso}
              type="button"
              className={`widget-calendar__day${
                selected === iso ? ' widget-calendar__day--selected' : ''
              }${iso === todayIso ? ' widget-calendar__day--today' : ''}`}
              data-testid={`calendar-day-${iso}`}
              aria-pressed={selected === iso}
              onClick={() => setSelected(iso)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      <p
        className="widget-calendar__selected"
        data-testid="calendar-selected-date"
      >
        {selected ? `Selected: ${selected}` : 'No date selected'}
      </p>
    </div>
  )
}
