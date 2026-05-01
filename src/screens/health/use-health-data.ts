import { useQuery } from '@tanstack/react-query'
import type {
  Dose,
  Inventory,
  Protocol,
  PeptideStats,
  HealthMetric,
  HealthSource,
  MetricHistoryPoint,
} from './types'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function usePeptideDoses() {
  return useQuery({
    queryKey: ['health', 'peptides', 'doses'],
    queryFn: async () => {
      const data = await fetchJson<{ doses: Dose[] }>(
        '/api/health/peptides?action=doses',
      )
      return data.doses
    },
    staleTime: 30_000,
  })
}

export function usePeptideInventory() {
  return useQuery({
    queryKey: ['health', 'peptides', 'inventory'],
    queryFn: async () => {
      const data = await fetchJson<{ inventory: Inventory[] }>(
        '/api/health/peptides?action=inventory',
      )
      return data.inventory
    },
    staleTime: 30_000,
  })
}

export function usePeptideProtocols() {
  return useQuery({
    queryKey: ['health', 'peptides', 'protocol'],
    queryFn: async () => {
      const data = await fetchJson<{ protocols: Protocol[] }>(
        '/api/health/peptides?action=protocol',
      )
      return data.protocols
    },
    staleTime: 60_000,
  })
}

export function usePeptideStats() {
  return useQuery({
    queryKey: ['health', 'peptides', 'stats'],
    queryFn: async () => {
      return fetchJson<PeptideStats>('/api/health/peptides?action=stats')
    },
    staleTime: 30_000,
  })
}

export function useLatestMetrics() {
  return useQuery({
    queryKey: ['health', 'metrics', 'latest'],
    queryFn: async () => {
      const data = await fetchJson<{
        metrics: HealthMetric[]
        sources: HealthSource[]
      }>('/api/health/metrics?action=latest')
      return data
    },
    staleTime: 30_000,
  })
}

export function useMetricHistory(metric: string, days: number = 30) {
  return useQuery({
    queryKey: ['health', 'metrics', 'history', metric, days],
    queryFn: async () => {
      const data = await fetchJson<{
        metric: string
        days: number
        data: MetricHistoryPoint[]
      }>(
        `/api/health/metrics?action=history&metric=${encodeURIComponent(metric)}&days=${days}`,
      )
      return data
    },
    staleTime: 60_000,
    enabled: !!metric,
  })
}
