import { useMemo } from 'react'
import { useChatHistory } from '../hooks/useChatHistory'
import { dateKeyFromIso } from '../lib/chatHistoryStorage'

function formatDayHeading(dateKey: string): string {
  if (dateKey === 'invalid') return 'Unknown date'
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  return new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(dt)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(d)
}

export default function HistoryPage() {
  const { clearAllHistory, exchanges } = useChatHistory()

  function handleDeleteHistory() {
    if (exchanges.length === 0) return
    if (
      window.confirm(
        'Delete all message history stored in this browser? This cannot be undone.',
      )
    ) {
      clearAllHistory()
    }
  }

  const byDay = useMemo(() => {
    const map = new Map<string, typeof exchanges>()
    for (const ex of exchanges) {
      const key = dateKeyFromIso(ex.userTimestamp)
      const list = map.get(key) ?? []
      list.push(ex)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.userTimestamp).getTime() -
          new Date(b.userTimestamp).getTime(),
      )
    }
    return [...map.entries()].sort((a, b) =>
      a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0,
    )
  }, [exchanges])

  return (
    <div className="panel">
      <h2 className="panel__heading">Message history</h2>
      <p className="panel__lede">
        Conversations are saved in this browser (your messages and assistant
        replies), grouped by day.
      </p>
      <div className="history-toolbar">
        <button
          type="button"
          className="history-delete-btn"
          data-testid="delete-history-button"
          disabled={exchanges.length === 0}
          onClick={handleDeleteHistory}
        >
          Delete history
        </button>
      </div>
      {byDay.length === 0 && (
        <p className="panel__empty">
          No history yet. Send a message in Chat to build your archive.
        </p>
      )}
      <div className="history-days">
        {byDay.map(([dateKey, dayExchanges]) => (
          <section key={dateKey} className="history-day">
            <h3 className="history-day__title">{formatDayHeading(dateKey)}</h3>
            <ol className="history-day__list">
              {dayExchanges.map((e) => (
                <li key={e.id} className="history-day__item">
                  <div className="history-meta">
                    <span>{formatTime(e.userTimestamp)}</span>
                  </div>
                  <div className="history-exchange">
                    <div className="history-exchange__role">You</div>
                    <div className="history-exchange__text">{e.userContent}</div>
                    <div className="history-exchange__role">Assistant</div>
                    <div className="history-exchange__text">
                      {e.assistantContent}
                    </div>
                    {e.assistantImageSrc ? (
                      <img
                        className="history-exchange__media"
                        src={e.assistantImageSrc}
                        alt=""
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
