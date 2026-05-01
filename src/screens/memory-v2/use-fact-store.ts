import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'
import type { Fact, FactStats, SortField, SortDir } from './types'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function useFactStore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search
  const debounceTimer = useMemo(
    () =>
      setTimeout(() => {
        setDebouncedQuery(searchQuery)
      }, 250),
    [searchQuery],
  )
  // Cleanup handled by React strict - the timer will update

  const factsQuery = useQuery({
    queryKey: ['fact-store', 'facts', debouncedQuery, selectedEntity],
    queryFn: async () => {
      if (selectedEntity) {
        const data = await fetchJson<{ facts: Fact[] }>(
          `/api/fact-store?action=probe&entity=${encodeURIComponent(selectedEntity)}`,
        )
        return data.facts
      }
      if (debouncedQuery) {
        const data = await fetchJson<{ facts: Fact[] }>(
          `/api/fact-store?action=search&q=${encodeURIComponent(debouncedQuery)}`,
        )
        return data.facts
      }
      const data = await fetchJson<{ facts: Fact[] }>(
        '/api/fact-store?action=list',
      )
      return data.facts
    },
    staleTime: 30_000,
  })

  const statsQuery = useQuery({
    queryKey: ['fact-store', 'stats'],
    queryFn: async () => {
      const data = await fetchJson<FactStats>('/api/fact-store?action=stats')
      return data
    },
    staleTime: 60_000,
  })

  const sortedFacts = useMemo(() => {
    const facts = factsQuery.data ?? []
    return [...facts].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp = (a.created_at || '').localeCompare(b.created_at || '')
          break
        case 'trust':
          cmp = (a.trust_score ?? 0) - (b.trust_score ?? 0)
          break
        case 'category':
          cmp = (a.category || '').localeCompare(b.category || '')
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [factsQuery.data, sortField, sortDir])

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('desc')
      }
    },
    [sortField],
  )

  return {
    facts: sortedFacts,
    stats: statsQuery.data,
    isLoading: factsQuery.isLoading,
    searchQuery,
    setSearchQuery,
    selectedEntity,
    setSelectedEntity,
    sortField,
    sortDir,
    toggleSort,
    refresh: () => {
      factsQuery.refetch()
      statsQuery.refetch()
    },
  }
}
