export type ServiceStatus = {
  name: string
  status: 'up' | 'down'
  responseTime: number
  endpoint: string
  error?: string
  details?: string
}

export type CronJob = {
  id?: string
  name?: string
  schedule?: string
  enabled?: boolean
  last_run?: string
  last_status?: string
  description?: string
  [key: string]: unknown
}
