import { cn } from '@/lib/utils'
import type { Fact, SortField, SortDir } from './types'

type FactCardProps = {
  fact: Fact
}

export function FactCard({ fact }: FactCardProps) {
  const trustColor = getTrustColor(fact.trust_score)
  const trustPercent = Math.round((fact.trust_score ?? 0) * 100)

  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 transition-shadow hover:shadow-sm dark:border-neutral-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed text-primary-900 dark:text-neutral-200">
          {fact.content}
        </p>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: trustColor + '20',
            color: trustColor,
          }}
        >
          {trustPercent}%
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-primary-500 dark:text-neutral-500">
        {fact.entity && (
          <span className="rounded-md bg-primary-100 px-1.5 py-0.5 font-medium text-primary-700 dark:bg-neutral-800 dark:text-neutral-300">
            {fact.entity}
          </span>
        )}
        {fact.category && (
          <span className="rounded-md bg-primary-50 px-1.5 py-0.5 dark:bg-neutral-900">
            {fact.category}
          </span>
        )}
        {fact.tags &&
          fact.tags
            .split(',')
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-primary-50 px-1.5 py-0.5 dark:bg-neutral-900"
              >
                #{tag.trim()}
              </span>
            ))}
        {fact.created_at && (
          <span className="ml-auto">
            {new Date(fact.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Trust bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${trustPercent}%`,
            backgroundColor: trustColor,
          }}
        />
      </div>
    </div>
  )
}

function getTrustColor(trust: number): string {
  if (trust >= 0.8) return '#22c55e' // green
  if (trust >= 0.6) return '#84cc16' // lime
  if (trust >= 0.4) return '#eab308' // yellow
  if (trust >= 0.2) return '#f97316' // orange
  return '#ef4444' // red
}

type SortControlsProps = {
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
}

export function SortControls({ sortField, sortDir, onSort }: SortControlsProps) {
  const fields: Array<{ key: SortField; label: string }> = [
    { key: 'date', label: 'Date' },
    { key: 'trust', label: 'Trust' },
    { key: 'category', label: 'Category' },
  ]

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-primary-500 dark:text-neutral-500">Sort:</span>
      {fields.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSort(key)}
          className={cn(
            'rounded-md px-2 py-1 transition-colors',
            sortField === key
              ? 'bg-primary-900 text-primary-50 dark:bg-neutral-200 dark:text-neutral-900'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-neutral-800 dark:text-neutral-400',
          )}
        >
          {label}
          {sortField === key && (sortDir === 'desc' ? ' ↓' : ' ↑')}
        </button>
      ))}
    </div>
  )
}

type EntityCloudProps = {
  entityCounts: Record<string, number>
  selectedEntity: string | null
  onSelect: (entity: string | null) => void
}

export function EntityCloud({
  entityCounts,
  selectedEntity,
  onSelect,
}: EntityCloudProps) {
  const entries = Object.entries(entityCounts).sort(
    ([, a], [, b]) => b - a,
  )

  if (entries.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-xs text-primary-400 dark:text-neutral-600">
        No entities found
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-md px-3 py-1.5 text-left text-xs transition-colors',
          selectedEntity === null
            ? 'bg-primary-900 text-primary-50 dark:bg-neutral-200 dark:text-neutral-900'
            : 'text-primary-600 hover:bg-primary-50 dark:text-neutral-400 dark:hover:bg-neutral-800',
        )}
      >
        All ({Object.values(entityCounts).reduce((a, b) => a + b, 0)})
      </button>
      {entries.map(([entity, count]) => (
        <button
          key={entity}
          onClick={() =>
            onSelect(selectedEntity === entity ? null : entity)
          }
          className={cn(
            'flex items-center justify-between rounded-md px-3 py-1.5 text-left text-xs transition-colors',
            selectedEntity === entity
              ? 'bg-primary-900 text-primary-50 dark:bg-neutral-200 dark:text-neutral-900'
              : 'text-primary-600 hover:bg-primary-50 dark:text-neutral-400 dark:hover:bg-neutral-800',
          )}
        >
          <span className="truncate">{entity}</span>
          <span className="ml-1 shrink-0 text-[10px] opacity-60">
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}
