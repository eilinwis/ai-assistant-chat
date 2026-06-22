import { useMemo, useState } from 'react'
import { useChatHistory } from '../hooks/useChatHistory'
import { dateKeyFromIso } from '../lib/chatHistoryStorage'

function formatDayLabel(dateKey: string): string {
  if (dateKey === 'invalid') return 'Unknown date'
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  return new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(dt)
}

export default function SearchChatsPage() {
  const { exchanges } = useChatHistory()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return exchanges.filter(
      (e) =>
        e.userContent.toLowerCase().includes(q) ||
        e.assistantContent.toLowerCase().includes(q),
    )
  }, [exchanges, query])

  return (
    <div className="panel">
      <h2 className="panel__heading">Search in chats</h2>
      <p className="panel__lede">
        Find past questions and answers stored in this browser.
      </p>
      <label className="search-field">
        <span className="search-field__label">Search</span>
        <input
          type="search"
          className="search-field__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type words from a message…"
          autoComplete="off"
        />
      </label>
      {query.trim() && results.length === 0 && (
        <p className="panel__empty">No matches for your search.</p>
      )}
      {!query.trim() && (
        <p className="panel__hint">Enter text to search your local history.</p>
      )}
      <ul className="search-results">
        {results.map((e) => {
          const key = dateKeyFromIso(e.userTimestamp)
          return (
            <li key={e.id} className="search-results__item">
              <div className="search-results__meta">{formatDayLabel(key)}</div>
              <div className="history-exchange">
                <div className="history-exchange__role">You</div>
                <div className="history-exchange__text">{e.userContent}</div>
                <div className="history-exchange__role">Assistant</div>
                <div className="history-exchange__text">{e.assistantContent}</div>
                {e.assistantImageSrc ? (
                  <img
                    className="history-exchange__media"
                    src={e.assistantImageSrc}
                    alt=""
                  />
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
