export type Fact = {
  id: number
  content: string
  entity: string
  category: string
  trust_score: number
  tags: string
  created_at: string
}

export type FactStats = {
  total: number
  categoryCounts: Record<string, number>
  trustBuckets: Record<string, number>
  entityCounts: Record<string, number>
}

export type SortField = 'date' | 'trust' | 'category'
export type SortDir = 'asc' | 'desc'
