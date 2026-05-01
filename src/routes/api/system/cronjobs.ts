import { createFileRoute } from '@tanstack/react-router'
import { execSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

export const Route = createFileRoute('/api/system/cronjobs')({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Try to read cronjobs from the hermes state DB
          const dbPath = path.resolve(os.homedir(), '.hermes', 'state.db')
          const jobs = safeQuery(
            dbPath,
            `SELECT * FROM cron_jobs ORDER BY created_at DESC`,
          )
          return Response.json({ jobs })
        } catch {
          // Fallback: try hermes CLI
          try {
            const hermesBin = path.resolve(
              os.homedir(),
              '.hermes',
              'bin',
              'hermes',
            )
            const output = execSync(`${hermesBin} cron list --json 2>/dev/null`, {
              encoding: 'utf-8',
              timeout: 5000,
            }).trim()
            const jobs = output ? JSON.parse(output) : []
            return Response.json({ jobs })
          } catch {
            return Response.json({ jobs: [] })
          }
        }
      },
    },
  },
})

function safeQuery(
  dbPath: string,
  sql: string,
): Array<Record<string, unknown>> {
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
