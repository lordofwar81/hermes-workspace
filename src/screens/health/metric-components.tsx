import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { HealthMetric, MetricHistoryPoint } from './types'

type MetricCardProps = {
  metric: HealthMetric
}

export function MetricCard({ metric }: MetricCardProps) {
  const label = formatMetricLabel(metric.metric_type)
  const icon = getMetricIcon(metric.metric_type)

  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 dark:border-neutral-800">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium text-primary-500 dark:text-neutral-500">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
        {formatValue(metric.value)}{' '}
        <span className="text-xs font-normal text-primary-400 dark:text-neutral-500">
          {metric.unit}
        </span>
      </div>
      <div className="mt-1 text-[10px] text-primary-400 dark:text-neutral-600">
        {formatDate(metric.recorded_at)}
      </div>
    </div>
  )
}

type MetricChartProps = {
  data: MetricHistoryPoint[]
  metricName: string
  color?: string
}

export function MetricChart({
  data,
  metricName,
  color = '#6366f1',
}: MetricChartProps) {
  const chartData = data.map((d) => ({
    date: formatDateShort(d.recorded_at),
    value: d.value,
  }))

  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 dark:border-neutral-800">
      <h3 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
        {formatMetricLabel(metricName)} Trend
      </h3>
      {chartData.length < 2 ? (
        <div className="flex h-40 items-center justify-center text-xs text-primary-400 dark:text-neutral-600">
          Not enough data for chart
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-primary-200, #e5e5e5)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="var(--color-primary-400, #999)"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="var(--color-primary-400, #999)"
              width={45}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: '1px solid var(--color-primary-200, #e5e5e5)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function formatMetricLabel(type: string): string {
  const labels: Record<string, string> = {
    weight: 'Weight',
    heart_rate: 'Heart Rate',
    resting_heart_rate: 'Resting HR',
    heart_rate_variability: 'HRV',
    step_count: 'Steps',
    steps: 'Steps',
    blood_oxygen: 'Blood Oxygen',
    blood_oxygen_saturation: 'O₂ Saturation',
    blood_pressure_systolic: 'BP Systolic',
    blood_pressure_diastolic: 'BP Diastolic',
    body_fat_percentage: 'Body Fat',
    bmi: 'BMI',
    body_mass_index: 'BMI',
    active_energy: 'Active Energy',
    exercise_minutes: 'Exercise',
    distance_walk_run: 'Distance',
    flights_climbed: 'Flights Climbed',
    sleep_hours: 'Sleep',
    temperature: 'Temperature',
    respiratory_rate: 'Respiratory Rate',
  }
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getMetricIcon(type: string): string {
  if (type.includes('heart_rate') || type === 'hrv') return '❤️'
  if (type.includes('weight') || type.includes('bmi') || type.includes('body_mass')) return '⚖️'
  if (type.includes('step') || type.includes('walk') || type.includes('distance')) return '🚶'
  if (type.includes('oxygen') || type.includes('blood_oxy')) return '🫁'
  if (type.includes('blood_pressure')) return '🩺'
  if (type.includes('body_fat')) return '📊'
  if (type.includes('sleep')) return '😴'
  if (type.includes('exercise') || type.includes('active_energy')) return '🏃'
  if (type.includes('temperature')) return '🌡️'
  if (type.includes('respiratory')) return '💨'
  return '📈'
}

function formatValue(value: number): string {
  if (value >= 1000) return value.toFixed(0)
  if (value >= 100) return value.toFixed(1)
  return value.toFixed(2)
}

function formatDate(ts: string): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}

function formatDateShort(ts: string): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ts
  }
}
