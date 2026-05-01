import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { usePageTitle } from '@/hooks/use-page-title'
import { Input } from '@/components/ui/input'
import { useFactStore } from './use-fact-store'
import { FactCard, SortControls, EntityCloud } from './components'

export function MemoryV2Screen() {
  usePageTitle('Holographic Memory')

  const {
    facts,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedEntity,
    setSelectedEntity,
    sortField,
    sortDir,
    toggleSort,
    refresh,
  } = useFactStore()

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-primary-200 px-4 pb-3 pt-4 dark:border-neutral-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
              Holographic Memory
            </h1>
            <p className="text-xs text-primary-500 dark:text-neutral-500">
              {stats
                ? `${stats.total} facts across ${Object.keys(stats.entityCounts).length} entities`
                : 'Loading...'}
            </p>
          </div>
          <button
            onClick={refresh}
            className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-400 dark:text-neutral-500"
          />
          <Input
            type="search"
            placeholder="Search facts, entities, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Entity sidebar */}
        <div className="w-48 shrink-0 overflow-y-auto border-r border-primary-200 py-3 dark:border-neutral-800">
          {stats && (
            <EntityCloud
              entityCounts={stats.entityCounts}
              selectedEntity={selectedEntity}
              onSelect={setSelectedEntity}
            />
          )}
        </div>

        {/* Facts list */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Sort controls */}
          <div className="flex items-center justify-between border-b border-primary-100 px-4 py-2 dark:border-neutral-800">
            <SortControls
              sortField={sortField}
              sortDir={sortDir}
              onSort={toggleSort}
            />
            <span className="text-xs text-primary-400 dark:text-neutral-600">
              {facts.length} result{facts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Facts grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-primary-400 dark:text-neutral-500">
                Loading facts...
              </div>
            ) : facts.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-primary-400 dark:text-neutral-500">
                <span>No facts found</span>
                {selectedEntity && (
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="text-xs text-primary-600 underline dark:text-neutral-400"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {facts.map((fact) => (
                  <FactCard key={fact.id} fact={fact} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
