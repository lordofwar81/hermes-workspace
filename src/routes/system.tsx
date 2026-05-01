import { Suspense, lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const SystemScreen = lazy(async () => {
  const module = await import('@/screens/system/system-screen')
  return { default: module.SystemScreen }
})

export const Route = createFileRoute('/system')({
  ssr: false,
  component: function SystemRoute() {
    return (
      <Suspense
        fallback={
          <div className="flex h-full min-h-[240px] items-center justify-center px-4 text-sm text-primary-500 dark:text-neutral-400">
            Loading System Status...
          </div>
        }
      >
        <SystemScreen />
      </Suspense>
    )
  },
})
