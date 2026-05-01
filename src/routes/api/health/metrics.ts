import { createFileRoute } from '@tanstack/react-router'
import { execSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

export const Route = createFileRoute('/api/health/metrics')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const action = url.searchParams.get('action') || 'latest'
        const dbPath = path.resolve(
          os.homedir(),
          '.hermes',
          'health_metrics.db',
        )

        try {
          switch (action) {
            case 'latest': {
              // Get the latest value for each metric type
              const metrics = safeQuery(
                dbPath,
                `SELECT m.metric_type, m.value, m.unit, m.recorded_at, m.metadata
                 FROM health_metrics m
                 INNER JOIN (
                   SELECT metric_type, MAX(recorded_at) as max_date
                   FROM health_metrics
                   GROUP BY metric_type
                 ) latest ON m.metric_type = latest.metric_type AND m.recorded_at = latest.max_date
                 ORDER BY m.metric_type`,
              )
              const sources = safeQuery(
                dbPath,
                `SELECT id, name, last_seen_at FROM health_sources ORDER BY last_seen_at DESC`,
              )
              return Response.json({ metrics, sources })
            }

            case 'history': {
              const metric =
                url.searchParams.get('metric') || 'weight'
              const days = Number(url.searchParams.get('days') || 30)
              const data = safeQuery(
                dbPath,
                `SELECT recorded_at, value, unit, metadata
                 FROM health_metrics
                 WHERE metric_type = '${metric.replace(/'/g, "''")}'
                 AND recorded_at >= datetime('now', '-${days} days')
                 ORDER BY recorded_at ASC`,
              )
              return Response.json({ metric, days, data })
            }

            default:
              return Response.json(
                { error: 'Unknown action' },
                { status: 400 },
              )
          }
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 },
          )
        }
      },
    },
  },
})

function safeQuery(dbPath: string, sql: string): Array<Record<string, unknown>> {
  try {
    const result = execSync(`sqlite3 -json "${dbPath}" "${sql}" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim()
    if (!result) return []
    return JSON.parse(result) as Array<Record<string, unknown>>
  } catch {
    return []
  }
}
