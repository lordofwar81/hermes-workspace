import { cn } from '@/lib/utils'
import type { ServiceStatus } from './types'

type ServiceCardProps = {
  service: ServiceStatus
}

export function ServiceCard({ service }: ServiceCardProps) {
  const isUp = service.status === 'up'

  return (
    <div
      className={cn(
        'rounded-xl border bg-surface p-4 shadow-xs/5 transition-colors',
        isUp
          ? 'border-primary-200 dark:border-neutral-800'
          : 'border-red-200 dark:border-red-900/50',
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block size-2.5 rounded-full',
              isUp ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50',
            )}
          />
          <h3 className="text-sm font-semibold text-primary-900 dark:text-neutral-100">
            {service.name}
          </h3>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            isUp
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          )}
        >
          {isUp ? 'UP' : 'DOWN'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-primary-500 dark:text-neutral-500">
        <div className="flex items-center justify-between">
          <span>Response Time</span>
          <span
            className={cn(
              'font-mono',
              service.responseTime < 100
                ? 'text-green-600 dark:text-green-400'
                : service.responseTime < 500
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400',
            )}
          >
            {service.responseTime}ms
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Endpoint</span>
          <span className="max-w-[200px] truncate font-mono text-[10px]">
            {service.endpoint}
          </span>
        </div>
        {service.details && (
          <div className="mt-1 rounded-md bg-primary-50 p-1.5 font-mono text-[10px] text-primary-600 dark:bg-neutral-800 dark:text-neutral-400">
            {service.details}
          </div>
        )}
        {service.error && (
          <div className="mt-1 rounded-md bg-red-50 p-1.5 text-[10px] text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {service.error}
          </div>
        )}
      </div>
    </div>
  )
}

type ModelInfoCardProps = {
  title: string
  description: string
  size: string
  context: string
  endpoint: string
  status: 'up' | 'down'
}

export function ModelInfoCard({
  title,
  description,
  size,
  context,
  endpoint,
  status,
}: ModelInfoCardProps) {
  const isUp = status === 'up'

  return (
    <div className="rounded-xl border border-primary-200 bg-surface p-4 shadow-xs/5 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-900 dark:text-neutral-100">
          {title}
        </h3>
        <span
          className={cn(
            'inline-block size-2 rounded-full',
            isUp ? 'bg-green-500' : 'bg-red-500',
          )}
        />
      </div>
      <p className="mb-2 text-xs text-primary-600 dark:text-neutral-400">
        {description}
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-primary-50 p-2 dark:bg-neutral-800">
          <div className="text-[10px] font-medium text-primary-400 dark:text-neutral-500">
            Size
          </div>
          <div className="font-mono text-primary-900 dark:text-neutral-200">
            {size}
          </div>
        </div>
        <div className="rounded-md bg-primary-50 p-2 dark:bg-neutral-800">
          <div className="text-[10px] font-medium text-primary-400 dark:text-neutral-500">
            Context
          </div>
          <div className="font-mono text-primary-900 dark:text-neutral-200">
            {context}
          </div>
        </div>
      </div>
      <div className="mt-2 truncate text-[10px] font-mono text-primary-400 dark:text-neutral-600">
        {endpoint}
      </div>
    </div>
  )
}
