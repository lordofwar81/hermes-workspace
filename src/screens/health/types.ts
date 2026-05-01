export type Dose = {
  id: number
  compound: string
  doseUnits: string
  site: string
  timestamp: string
  fastHours: number | null
  notes: string
  cycleDay: number | null
  week: number | null
}

export type Inventory = {
  id: number
  compound: string
  vialsStart: number
  vialsCurrent: number
  lastUpdated: string
  reorderThreshold: number
}

export type Protocol = {
  id: number
  compound: string
  concentration: string
  weeklyTotal: string
  reconstitution: string
  startDate: string
  cycleDay: number
}

export type PeptideStats = {
  totalDoses: number
  firstDose: string | null
  lastDose: string | null
  compounds: Array<{ compound: string; count: number }>
  recentStreak: number
}

export type HealthMetric = {
  metric_type: string
  value: number
  unit: string
  recorded_at: string
  metadata: string
}

export type HealthSource = {
  id: number
  name: string
  last_seen_at: string
}

export type MetricHistoryPoint = {
  recorded_at: string
  value: number
  unit: string
  metadata: string
}
