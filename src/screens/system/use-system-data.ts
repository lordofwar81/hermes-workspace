import { useQuery } from '@tanstack/react-query'
import type { ServiceStatus, CronJob } from './types'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const data = await fetchJson<{ services: ServiceStatus[] }>(
        '/api/system/health?action=all',
      )
      return data.services
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useCronJobs() {
  return useQuery({
    queryKey: ['system', 'cronjobs'],
    queryFn: async () => {
      const data = await fetchJson<{ jobs: CronJob[] }>(
        '/api/system/cronjobs',
      )
      return data.jobs
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
