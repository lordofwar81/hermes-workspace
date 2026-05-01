import { usePageTitle } from '@/hooks/use-page-title'
import { useSystemHealth, useCronJobs } from './use-system-data'
import { ServiceCard, ModelInfoCard } from './components'
import type { CronJob } from './types'

export function SystemScreen() {
  usePageTitle('System Status')

  const { data: services, isLoading: loadingHealth } = useSystemHealth()
  const { data: cronJobs, isLoading: loadingCron } = useCronJobs()

  // Get model statuses for the model info cards
  const minimaxStatus =
    services?.find((s) => s.name.includes('MiniMax'))?.status ?? 'down'
  const macStudioStatus =
    services?.find((s) => s.name.includes('Qwen'))?.status ?? 'down'
  const bgeStatus =
    services?.find((s) => s.name.includes('BGE'))?.status ?? 'down'

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-primary-200 px-4 pb-3 pt-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
              System Status
            </h1>
            <p className="text-xs text-primary-500 dark:text-neutral-500">
              Auto-refreshes every 30 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-primary-500 dark:text-neutral-400">
              Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Service Grid */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
            Services
          </h2>
          {loadingHealth ? (
            <div className="flex h-20 items-center justify-center text-sm text-primary-400 dark:text-neutral-500">
              Checking services...
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services?.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          )}
        </section>

        {/* Local Models */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
            Local Models
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <ModelInfoCard
              title="MiniMax-M2.7-APEX-I-Mini"
              description="Heavy computation & complex reasoning (81GB, Strix Halo)"
              size="81 GB"
              context="65K tokens"
              endpoint="http://192.168.1.229:8199/v1"
              status={minimaxStatus}
            />
            <ModelInfoCard
              title="Qwen3.6-35B-A3B (Mac Studio)"
              description="Task orchestration & routing (MLX-4bit, Apple Silicon)"
              size="18 GB"
              context="32K tokens"
              endpoint="http://192.168.1.149:1234/v1"
              status={macStudioStatus}
            />
            <ModelInfoCard
              title="BGE-M3"
              description="Memory embeddings (1024-dimensional vectors)"
              size="1.1 GB (F16)"
              context="8K tokens"
              endpoint="http://127.0.0.1:11434"
              status={bgeStatus}
            />
          </div>
        </section>

        {/* Cronjobs */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-primary-900 dark:text-neutral-200">
            Scheduled Jobs
          </h2>
          {loadingCron ? (
            <div className="flex h-16 items-center justify-center text-sm text-primary-400 dark:text-neutral-500">
              Loading cronjobs...
            </div>
          ) : cronJobs && cronJobs.length > 0 ? (
            <div className="rounded-xl border border-primary-200 bg-surface dark:border-neutral-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-primary-200 dark:border-neutral-800">
                      <th className="px-4 py-2 font-medium text-primary-500 dark:text-neutral-500">
                        Name
                      </th>
                      <th className="px-4 py-2 font-medium text-primary-500 dark:text-neutral-500">
                        Schedule
                      </th>
                      <th className="px-4 py-2 font-medium text-primary-500 dark:text-neutral-500">
                        Status
                      </th>
                      <th className="px-4 py-2 font-medium text-primary-500 dark:text-neutral-500">
                        Last Run
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronJobs.map((job, i) => (
                      <CronJobRow key={job.id ?? i} job={job} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-primary-200 bg-surface p-8 text-center text-sm text-primary-400 dark:border-neutral-800 dark:text-neutral-600">
              No cronjobs configured
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function CronJobRow({ job }: { job: CronJob }) {
  const isEnabled = job.enabled !== false
  return (
    <tr className="border-b border-primary-100 transition-colors hover:bg-primary-50/50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30">
      <td className="px-4 py-2 font-medium text-primary-900 dark:text-neutral-200">
        {job.name || job.id || 'Unnamed'}
      </td>
      <td className="px-4 py-2 font-mono text-primary-600 dark:text-neutral-400">
        {job.schedule || '—'}
      </td>
      <td className="px-4 py-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            isEnabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-neutral-400'}`}
          />
          {isEnabled ? 'Active' : 'Paused'}
        </span>
      </td>
      <td className="px-4 py-2 text-primary-500 dark:text-neutral-500">
        {job.last_run ? formatDate(job.last_run) : '—'}
      </td>
    </tr>
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
