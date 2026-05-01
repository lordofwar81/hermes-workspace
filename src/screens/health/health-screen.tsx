import { useState } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import {
  usePeptideDoses,
  usePeptideInventory,
  usePeptideProtocols,
  usePeptideStats,
  useLatestMetrics,
  useMetricHistory,
} from './use-health-data'
import { ProtocolCard, DoseHistoryTable, InventoryCard } from './peptide-components'
import { MetricCard, MetricChart } from './metric-components'

export function HealthScreen() {
  usePageTitle('Health Dashboard')
  const [tab, setTab] = useState<'peptides' | 'apple-health'>('peptides')

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'peptides' | 'apple-health')}
        className="h-full min-h-0 gap-0"
      >
        <div className="border-b border-primary-200 px-3 pt-3 dark:border-neutral-800 md:px-4 md:pt-4">
          <TabsList variant="underline" className="w-full justify-start gap-1">
            <TabsTab value="peptides">Peptide Tracker</TabsTab>
            <TabsTab value="apple-health">Apple Health</TabsTab>
          </TabsList>
        </div>

        <TabsPanel value="peptides" className="min-h-0 flex-1">
          {tab === 'peptides' ? <PeptideTab /> : null}
        </TabsPanel>

        <TabsPanel value="apple-health" className="min-h-0 flex-1">
          {tab === 'apple-health' ? <AppleHealthTab /> : null}
        </TabsPanel>
      </Tabs>
    </div>
  )
}

function PeptideTab() {
  const { data: protocols } = usePeptideProtocols()
  const { data: doses } = usePeptideDoses()
  const { data: inventory } = usePeptideInventory()
  const { data: stats } = usePeptideStats()

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Doses"
          value={String(stats?.totalDoses ?? 0)}
        />
        <StatCard
          label="Last Dose"
          value={stats?.lastDose ? formatDate(stats.lastDose) : '—'}
        />
        <StatCard
          label="Active Compounds"
          value={String(stats?.compounds.length ?? 0)}
        />
        <StatCard
          label="30-Day Doses"
          value={String(stats?.recentStreak ?? 0)}
        />
      </div>

      {/* Active Protocols */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
          Active Protocols
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {protocols?.map((p) => <ProtocolCard key={p.id} protocol={p} />)}
        </div>
      </section>

      {/* Inventory */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
          Inventory
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inventory?.map((item) => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Dose History */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
          Recent Injections
        </h2>
        <div className="rounded-xl border border-primary-200 bg-surface dark:border-neutral-800">
          {doses && doses.length > 0 ? (
            <DoseHistoryTable doses={doses} />
          ) : (
            <div className="p-8 text-center text-sm text-primary-400 dark:text-neutral-600">
              No injection history found
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function AppleHealthTab() {
  const { data: latestData } = useLatestMetrics()
  const { data: weightHistory } = useMetricHistory('weight', 30)
  const { data: hrHistory } = useMetricHistory('heart_rate', 30)

  const metrics = latestData?.metrics ?? []
  const sources = latestData?.sources ?? []

  // Pick key metrics for cards
  const keyMetricTypes = [
    'weight',
    'resting_heart_rate',
    'heart_rate',
    'heart_rate_variability',
    'step_count',
    'steps',
    'blood_oxygen',
    'blood_oxygen_saturation',
    'blood_pressure_systolic',
    'temperature',
  ]

  const keyMetrics = keyMetricTypes
    .map((type) => metrics.find((m) => m.metric_type === type))
    .filter(Boolean)

  const uniqueMetrics = Array.from(
    new Map(keyMetrics.map((m) => [m!.metric_type, m])).values(),
  )

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Key Metrics */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
          Key Metrics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {uniqueMetrics.map((metric) => (
            <MetricCard key={metric!.metric_type} metric={metric!} />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        {weightHistory && weightHistory.data.length > 0 && (
          <MetricChart
            data={weightHistory.data}
            metricName="weight"
            color="#6366f1"
          />
        )}
        {hrHistory && hrHistory.data.length > 0 && (
          <MetricChart
            data={hrHistory.data}
            metricName="heart_rate"
            color="#ef4444"
          />
        )}
      </section>

      {/* All Metrics */}
      {metrics.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
            All Metrics ({metrics.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {metrics
              .filter((m) => !keyMetricTypes.includes(m.metric_type))
              .map((m) => (
                <MetricCard key={m.metric_type} metric={m} />
              ))}
          </div>
        </section>
      )}

      {/* Last Synced */}
      {sources.length > 0 && (
        <div className="mt-4 text-xs text-primary-400 dark:text-neutral-600">
          Last synced:{' '}
          {sources[0]?.last_seen_at
            ? formatDate(sources[0].last_seen_at)
            : 'Unknown'}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 dark:border-neutral-800">
      <div className="text-xs font-medium text-primary-500 dark:text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-primary-900 dark:text-neutral-100">
        {value}
      </div>
    </div>
  )
}

function formatDate(ts: string): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ts
  }
}
