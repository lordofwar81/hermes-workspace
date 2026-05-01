import { createFileRoute } from '@tanstack/react-router'
import { execSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

export const Route = createFileRoute('/api/fact-store')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const action = url.searchParams.get('action') || 'list'
        const dbPath = path.resolve(os.homedir(), '.hermes', 'fact_store.db')

        try {
          switch (action) {
            case 'search': {
              const q = url.searchParams.get('q') || ''
              const data = queryFacts(dbPath)
              const filtered = q
                ? data.filter(
                    (f: FactRow) =>
                      f.content?.toLowerCase().includes(q.toLowerCase()) ||
                      f.entity?.toLowerCase().includes(q.toLowerCase()) ||
                      f.tags?.toLowerCase().includes(q.toLowerCase()),
                  )
                : data
              return Response.json({ facts: filtered })
            }

            case 'probe': {
              const entity = url.searchParams.get('entity') || ''
              const data = queryFacts(dbPath)
              const filtered = entity
                ? data.filter(
                    (f: FactRow) =>
                      f.entity?.toLowerCase() === entity.toLowerCase(),
                  )
                : data
              return Response.json({ facts: filtered })
            }

            case 'stats': {
              const data = queryFacts(dbPath)
              const categoryCounts: Record<string, number> = {}
              const trustBuckets: Record<string, number> = {
                '0.0-0.2': 0,
                '0.2-0.4': 0,
                '0.4-0.6': 0,
                '0.6-0.8': 0,
                '0.8-1.0': 0,
              }
              const entityCounts: Record<string, number> = {}

              for (const f of data) {
                const cat = f.category || 'general'
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1

                const trust = f.trust_score ?? 0
                if (trust < 0.2) trustBuckets['0.0-0.2']++
                else if (trust < 0.4) trustBuckets['0.2-0.4']++
                else if (trust < 0.6) trustBuckets['0.4-0.6']++
                else if (trust < 0.8) trustBuckets['0.6-0.8']++
                else trustBuckets['0.8-1.0']++

                if (f.entity) {
                  entityCounts[f.entity] = (entityCounts[f.entity] || 0) + 1
                }
              }

              return Response.json({
                total: data.length,
                categoryCounts,
                trustBuckets,
                entityCounts,
              })
            }

            case 'list':
            default: {
              const data = queryFacts(dbPath)
              return Response.json({ facts: data })
            }
          }
        } catch (err) {
          return Response.json(
            {
              error: err instanceof Error ? err.message : String(err),
              facts: [],
            },
            { status: 500 },
          )
        }
      },
    },
  },
})

type FactRow = {
  id: number
  content: string
  entity: string
  category: string
  trust_score: number
  tags: string
  created_at: string
}

function queryFacts(dbPath: string): FactRow[] {
  // Check if DB exists and has tables
  try {
    const tables = execSync(
      `sqlite3 "${dbPath}" "SELECT name FROM sqlite_master WHERE type='table' AND name='facts'" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 },
    ).trim()

    if (!tables) {
      // No facts table — try alternative table names or return empty
      return tryAlternativeSchemas(dbPath)
    }

    const rows = execSync(
      `sqlite3 -json "${dbPath}" "SELECT id, content, entity, category, trust_score, tags, created_at FROM facts ORDER BY created_at DESC LIMIT 500" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 },
    ).trim()

    if (!rows) return []
    return JSON.parse(rows) as FactRow[]
  } catch {
    return []
  }
}

function tryAlternativeSchemas(dbPath: string): FactRow[] {
  try {
    // Try to discover any table with relevant columns
    const allTables = execSync(
      `sqlite3 "${dbPath}" "SELECT name FROM sqlite_master WHERE type='table'" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 },
    ).trim()

    if (!allTables) return []

    const tableList = allTables.split('\n').filter(Boolean)

    for (const table of tableList) {
      const safeName = table.replace(/"/g, '""')
      try {
        const rows = execSync(
          `sqlite3 -json "${dbPath}" "SELECT rowid as id, * FROM \\"${safeName}\\" LIMIT 500" 2>/dev/null`,
          { encoding: 'utf-8', timeout: 5000 },
        ).trim()

        if (rows) {
          const parsed = JSON.parse(rows)
          // Normalize whatever columns exist into our FactRow shape
          return parsed.map(
            (row: Record<string, unknown>, i: number): FactRow => ({
              id: (row.id as number) ?? i,
              content: String(row.content ?? row.fact ?? row.text ?? row.value ?? ''),
              entity: String(row.entity ?? row.subject ?? ''),
              category: String(row.category ?? row.type ?? 'general'),
              trust_score: Number(row.trust_score ?? row.confidence ?? 0.5),
              tags: String(row.tags ?? ''),
              created_at: String(row.created_at ?? row.created ?? row.timestamp ?? ''),
            }),
          )
        }
      } catch {
        continue
      }
    }
  } catch {
    // ignore
  }
  return []
}
