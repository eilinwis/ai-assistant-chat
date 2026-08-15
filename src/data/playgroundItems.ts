export type PlaygroundCategory = 'frontend' | 'backend' | 'testing' | 'design'

export interface PlaygroundItem {
  id: string
  title: string
  category: PlaygroundCategory
}

export const PLAYGROUND_CATEGORIES: PlaygroundCategory[] = [
  'frontend',
  'backend',
  'testing',
  'design',
]

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  { id: 'p1', title: 'Responsive navbar', category: 'frontend' },
  { id: 'p2', title: 'Auth middleware', category: 'backend' },
  { id: 'p3', title: 'Locator strategy guide', category: 'testing' },
  { id: 'p4', title: 'Color palette tokens', category: 'design' },
  { id: 'p5', title: 'Drag and drop board', category: 'frontend' },
  { id: 'p6', title: 'Rate limiter', category: 'backend' },
  { id: 'p7', title: 'Visual regression suite', category: 'testing' },
  { id: 'p8', title: 'Empty state illustrations', category: 'design' },
]
