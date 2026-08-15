import { useState, type DragEvent } from 'react'

interface DndItem {
  id: string
  label: string
}

const INITIAL_ITEMS: DndItem[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
]

export default function DragAndDrop() {
  const [available, setAvailable] = useState<DndItem[]>(INITIAL_ITEMS)
  const [dropped, setDropped] = useState<DndItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  function handleDragStart(e: DragEvent<HTMLLIElement>, item: DndItem) {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const id = e.dataTransfer.getData('text/plain')
    const item = available.find((i) => i.id === id)
    if (!item) return
    setAvailable((prev) => prev.filter((i) => i.id !== id))
    setDropped((prev) => [...prev, item])
  }

  function handleReset() {
    setAvailable(INITIAL_ITEMS)
    setDropped([])
  }

  return (
    <div className="widget-dnd">
      <ul className="widget-dnd__source" data-testid="dnd-source">
        {available.map((item) => (
          <li
            key={item.id}
            className="widget-dnd__item"
            draggable
            data-testid={`dnd-item-${item.id}`}
            onDragStart={(e) => handleDragStart(e, item)}
          >
            {item.label}
          </li>
        ))}
        {available.length === 0 && (
          <li className="widget-dnd__empty">All items dropped.</li>
        )}
      </ul>
      <div
        className={`widget-dnd__dropzone${isDragOver ? ' widget-dnd__dropzone--over' : ''}`}
        data-testid="dnd-dropzone"
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <p className="widget-dnd__dropzone-label">Drop here</p>
        <ul className="widget-dnd__dropped" data-testid="dnd-dropped-list">
          {dropped.map((item) => (
            <li key={item.id} data-testid={`dnd-dropped-${item.id}`}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="widget-dnd__reset"
        data-testid="dnd-reset"
        onClick={handleReset}
        disabled={dropped.length === 0}
      >
        Reset
      </button>
    </div>
  )
}
