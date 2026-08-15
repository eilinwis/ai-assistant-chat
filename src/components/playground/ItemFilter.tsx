import { useMemo, useState } from 'react'
import {
  PLAYGROUND_CATEGORIES,
  PLAYGROUND_ITEMS,
  type PlaygroundCategory,
} from '../../data/playgroundItems'

export default function ItemFilter() {
  const [query, setQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState<
    Set<PlaygroundCategory>
  >(new Set())

  function toggleCategory(category: PlaygroundCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PLAYGROUND_ITEMS.filter((item) => {
      const matchesQuery = !q || item.title.toLowerCase().includes(q)
      const matchesCategory =
        activeCategories.size === 0 || activeCategories.has(item.category)
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategories])

  return (
    <div className="widget-filter">
      <input
        type="search"
        className="widget-filter__input"
        data-testid="filter-search-input"
        placeholder="Filter by title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="widget-filter__categories">
        {PLAYGROUND_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`widget-filter__category${
              activeCategories.has(category)
                ? ' widget-filter__category--active'
                : ''
            }`}
            data-testid={`filter-category-${category}`}
            aria-pressed={activeCategories.has(category)}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      {results.length === 0 ? (
        <p className="widget-filter__empty" data-testid="filter-empty-state">
          No items match your filters.
        </p>
      ) : (
        <ul className="widget-filter__results" data-testid="filter-results-list">
          {results.map((item) => (
            <li
              key={item.id}
              className="widget-filter__result"
              data-testid={`filter-result-${item.id}`}
            >
              <span>{item.title}</span>
              <span className="widget-filter__result-tag">{item.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
