import { Suspense, lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const MemoryV2Screen = lazy(async () => {
  const module = await import('@/screens/memory-v2/memory-v2-screen')
  return { default: module.MemoryV2Screen }
})

export const Route = createFileRoute('/memory-v2')({
  ssr: false,
  component: function MemoryV2Route() {
    return (
      <Suspense
        fallback={
          <div className="flex h-full min-h-[240px] items-center justify-center px-4 text-sm text-primary-500 dark:text-neutral-400">
            Loading Holographic Memory...
          </div>
        }
      >
        <MemoryV2Screen />
      </Suspense>
    )
  },
})
