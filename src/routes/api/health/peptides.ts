import { createFileRoute } from '@tanstack/react-router'
import { execSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

export const Route = createFileRoute('/api/health/peptides')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const action = url.searchParams.get('action') || 'doses'
        const dbPath = path.resolve(
          os.homedir(),
          '.hermes',
          'peptide_tracker.db',
        )

        try {
          switch (action) {
            case 'doses': {
              const data = safeQuery(
                dbPath,
                `SELECT id, compound, dose_units as doseUnits, site, timestamp, fast_hours as fastHours, notes, cycle_day as cycleDay, week FROM doses ORDER BY timestamp DESC LIMIT 100`,
              )
              return Response.json({ doses: data })
            }

            case 'inventory': {
              const data = safeQuery(
                dbPath,
                `SELECT id, compound, vials_start as vialsStart, vials_current as vialsCurrent, last_updated as lastUpdated, reorder_threshold as reorderThreshold FROM inventory ORDER BY compound`,
              )
              return Response.json({ inventory: data })
            }

            case 'protocol': {
              const data = safeQuery(
                dbPath,
                `SELECT id, compound, concentration, weekly_total as weeklyTotal, reconstitution, start_date as startDate, cycle_day as cycleDay FROM protocol ORDER BY start_date DESC`,
              )
              return Response.json({ protocols: data })
            }

            case 'stats': {
              const doses = safeQuery(
                dbPath,
                `SELECT COUNT(*) as totalDoses, MIN(timestamp) as firstDose, MAX(timestamp) as lastDose FROM doses`,
              )
              const compounds = safeQuery(
                dbPath,
                `SELECT compound, COUNT(*) as count FROM doses GROUP BY compound ORDER BY count DESC`,
              )
              const streak = safeQuery(
                dbPath,
                `SELECT COUNT(*) as streakDays FROM doses WHERE timestamp >= datetime('now', '-30 days')`,
              )
              return Response.json({
                totalDoses: doses[0]?.totalDoses ?? 0,
                firstDose: doses[0]?.firstDose ?? null,
                lastDose: doses[0]?.lastDose ?? null,
                compounds,
                recentStreak: streak[0]?.streakDays ?? 0,
              })
            }

            default:
              return Response.json({ error: 'Unknown action' }, { status: 400 })
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
