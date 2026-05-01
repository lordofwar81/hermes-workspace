import { cn } from '@/lib/utils'
import type { Dose, Inventory, Protocol } from './types'

type ProtocolCardProps = {
  protocol: Protocol
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-900 dark:text-neutral-100">
          {protocol.compound}
        </h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Active
        </span>
      </div>
      <div className="grid gap-1 text-xs text-primary-600 dark:text-neutral-400">
        {protocol.concentration && (
          <div>
            <span className="font-medium text-primary-500 dark:text-neutral-500">
              Concentration:
            </span>{' '}
            {protocol.concentration}
          </div>
        )}
        {protocol.weeklyTotal && (
          <div>
            <span className="font-medium text-primary-500 dark:text-neutral-500">
              Weekly:
            </span>{' '}
            {protocol.weeklyTotal}
          </div>
        )}
        {protocol.reconstitution && (
          <div>
            <span className="font-medium text-primary-500 dark:text-neutral-500">
              Storage:
            </span>{' '}
            {protocol.reconstitution}
          </div>
        )}
        {protocol.startDate && (
          <div>
            <span className="font-medium text-primary-500 dark:text-neutral-500">
              Started:
            </span>{' '}
            {new Date(protocol.startDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}

type DoseHistoryTableProps = {
  doses: Dose[]
}

export function DoseHistoryTable({ doses }: DoseHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-primary-200 dark:border-neutral-800">
            <th className="px-3 py-2 font-medium text-primary-500 dark:text-neutral-500">
              Date
            </th>
            <th className="px-3 py-2 font-medium text-primary-500 dark:text-neutral-500">
              Compound
            </th>
            <th className="px-3 py-2 font-medium text-primary-500 dark:text-neutral-500">
              Dose
            </th>
            <th className="px-3 py-2 font-medium text-primary-500 dark:text-neutral-500">
              Site
            </th>
            <th className="px-3 py-2 font-medium text-primary-500 dark:text-neutral-500">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {doses.map((dose) => (
            <tr
              key={dose.id}
              className="border-b border-primary-100 transition-colors hover:bg-primary-50/50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
            >
              <td className="px-3 py-2 whitespace-nowrap text-primary-900 dark:text-neutral-300">
                {formatDate(dose.timestamp)}
              </td>
              <td className="px-3 py-2 font-medium text-primary-900 dark:text-neutral-200">
                {dose.compound}
              </td>
              <td className="px-3 py-2 text-primary-600 dark:text-neutral-400">
                {dose.doseUnits}
              </td>
              <td className="px-3 py-2 text-primary-600 dark:text-neutral-400">
                {dose.site || '—'}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-primary-500 dark:text-neutral-500">
                {dose.notes || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type InventoryCardProps = {
  item: Inventory
}

export function InventoryCard({ item }: InventoryCardProps) {
  const percentRemaining =
    item.vialsStart > 0
      ? Math.round((item.vialsCurrent / item.vialsStart) * 100)
      : 0
  const barColor =
    percentRemaining > 50
      ? 'bg-green-500'
      : percentRemaining > 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="rounded-lg border border-primary-200 bg-surface p-3 dark:border-neutral-800">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-900 dark:text-neutral-200">
          {item.compound}
        </span>
        <span className="text-xs text-primary-500 dark:text-neutral-500">
          {item.vialsCurrent.toFixed(1)}/{item.vialsStart} vials
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-neutral-800">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
      {item.reorderThreshold > 0 && item.vialsCurrent <= item.reorderThreshold && (
        <p className="mt-1 text-[10px] font-medium text-red-500">
          ⚠ Below reorder threshold ({item.reorderThreshold})
        </p>
      )}
    </div>
  )
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
