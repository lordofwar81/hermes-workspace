import { Suspense, lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const HealthScreen = lazy(async () => {
  const module = await import('@/screens/health/health-screen')
  return { default: module.HealthScreen }
})

export const Route = createFileRoute('/health')({
  ssr: false,
  component: function HealthRoute() {
    return (
      <Suspense
        fallback={
          <div className="flex h-full min-h-[240px] items-center justify-center px-4 text-sm text-primary-500 dark:text-neutral-400">
            Loading Health Dashboard...
          </div>
        }
      >
        <HealthScreen />
      </Suspense>
    )
  },
})
