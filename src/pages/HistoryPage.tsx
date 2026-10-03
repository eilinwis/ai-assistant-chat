import { useEffect, useMemo, useRef, useState } from 'react'
import { useChatHistory } from '../hooks/useChatHistory'
import { dateKeyFromIso } from '../lib/chatHistoryStorage'
import type { ChatExchange } from '../types/ChatExchange'
import { useHardMode, useTid } from '../hardMode/useHardMode'

const PAGE_SIZE = 5
const REMOUNT_EVERY_MS = 3000

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

function exportHistory(exchanges: ChatExchange[]) {
  const blob = new Blob([JSON.stringify(exchanges, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chat-history.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function HistoryPage() {
  const { clearAllHistory, exchanges } = useChatHistory()
  const { isOn, rand } = useHardMode()
  const tid = useTid()
  const slow = isOn('slow-history')
  const unstable = isOn('unstable-dom')

  // slow-history: skeletons first, then PAGE_SIZE items at a time on scroll.
  const [ready, setReady] = useState(!slow)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // unstable-dom: bumping this key re-mounts the list (read-only, so no
  // user state is lost — only element identity).
  const [generation, setGeneration] = useState(0)

  const initialDelay = 600 + Math.floor(rand('history-load') * 1400)
  useEffect(() => {
    if (ready) return
    const id = setTimeout(() => setReady(true), initialDelay)
    return () => clearTimeout(id)
  }, [ready, initialDelay])

  useEffect(() => {
    if (!unstable) return
    const id = setInterval(() => setGeneration((g) => g + 1), REMOUNT_EVERY_MS)
    return () => clearInterval(id)
  }, [unstable])

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

  const visibleDays = useMemo(() => {
    if (!slow) return byDay
    let budget = visibleCount
    const days: typeof byDay = []
    for (const [key, list] of byDay) {
      if (budget <= 0) break
      days.push([key, list.slice(0, budget)])
      budget -= list.length
    }
    return days
  }, [byDay, slow, visibleCount])

  const hasMore = slow && visibleCount < exchanges.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!hasMore || !ready || loadingMore || !sentinel) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setLoadingMore(true)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, ready, loadingMore, generation])

  useEffect(() => {
    if (!loadingMore) return
    const delay = 400 + Math.floor(rand('history-page', visibleCount) * 800)
    const id = setTimeout(() => {
      setVisibleCount((n) => n + PAGE_SIZE)
      setLoadingMore(false)
    }, delay)
    return () => clearTimeout(id)
  }, [loadingMore, rand, visibleCount])

  return (
    <div className="panel">
      <h2 className="panel__heading">Message history</h2>
      <p className="panel__lede">
        Conversations are saved in this browser (your messages and assistant
        replies), grouped by day.
      </p>
      <div className="history-toolbar">
        {isOn('files') && (
          <button
            type="button"
            className="history-export-btn"
            {...tid('export-history-button')}
            disabled={exchanges.length === 0}
            onClick={() => exportHistory(exchanges)}
          >
            Export history
          </button>
        )}
        <button
          type="button"
          className="history-delete-btn"
          {...tid('delete-history-button')}
          disabled={exchanges.length === 0}
          onClick={handleDeleteHistory}
        >
          Delete history
        </button>
      </div>
      {!ready && (
        <div className="history-skeletons" role="status" aria-busy="true" aria-label="Loading history">
          {[0, 1, 2].map((i) => (
            <div key={i} className="history-skeleton" />
          ))}
        </div>
      )}
      {ready && byDay.length === 0 && (
        <p className="panel__empty">
          No history yet. Send a message in Chat to build your archive.
        </p>
      )}
      {ready && (
        <div className="history-days" key={generation}>
          {visibleDays.map(([dateKey, dayExchanges]) => (
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
          {hasMore && (
            <div ref={sentinelRef} className="history-more" role="status">
              {loadingMore ? 'Loading more…' : 'Scroll for more'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
