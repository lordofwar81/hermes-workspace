import { createFileRoute } from '@tanstack/react-router'
import { execSync } from 'node:child_process'

export const Route = createFileRoute('/api/system/health')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const action = url.searchParams.get('action') || 'all'

        try {
          switch (action) {
            case 'gateway': {
              const result = await checkService(
                'Hermes Gateway',
                'http://127.0.0.1:8642/health',
              )
              return Response.json({ services: [result] })
            }

            case 'models': {
              const [minimax, bge] = await Promise.all([
                checkService(
                  'MiniMax (Strix Halo)',
                  'http://192.168.1.229:8199/v1/models',
                ),
                checkService(
                  'BGE-M3 Embeddings',
                  'http://127.0.0.1:11434/api/tags',
                ),
              ])
              return Response.json({ services: [minimax, bge] })
            }

            case 'platforms': {
              const result = await checkService(
                'Hermes Dashboard',
                'http://127.0.0.1:9119/api/health',
              )
              return Response.json({ services: [result] })
            }

            case 'all':
            default: {
              const [gateway, minimax, bge, dashboard] = await Promise.all([
                checkService(
                  'Hermes Gateway',
                  'http://127.0.0.1:8642/health',
                ),
                checkService(
                  'MiniMax (Strix Halo)',
                  'http://192.168.1.229:8199/v1/models',
                ),
                checkService(
                  'BGE-M3 Embeddings',
                  'http://127.0.0.1:11434/api/tags',
                ),
                checkService(
                  'Hermes Dashboard',
                  'http://127.0.0.1:9119/api/health',
                ),
              ])
              return Response.json({
                services: [gateway, minimax, bge, dashboard],
              })
            }
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

type ServiceCheck = {
  name: string
  status: 'up' | 'down'
  responseTime: number
  endpoint: string
  error?: string
  details?: string
}

async function checkService(
  name: string,
  endpoint: string,
): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(5000),
    })
    const elapsed = Date.now() - start
    let details: string | undefined

    // Try to get model details from Ollama
    if (endpoint.includes(':11434') && res.ok) {
      try {
        const body = (await res.json()) as { models?: Array<{ name: string }> }
        if (body.models?.length) {
          details = body.models.map((m) => m.name).join(', ')
        }
      } catch {
        // ignore
      }
    }

    // Try to get model details from MiniMax
    if (endpoint.includes(':8199') && res.ok) {
      try {
        const body = (await res.json()) as { data?: Array<{ id: string }> }
        if (body.data?.length) {
          details = body.data.map((m) => m.id).join(', ')
        }
      } catch {
        // ignore
      }
    }

    return {
      name,
      status: res.ok ? 'up' : 'down',
      responseTime: elapsed,
      endpoint,
      details,
    }
  } catch (err) {
    return {
      name,
      status: 'down',
      responseTime: Date.now() - start,
      endpoint,
      error: err instanceof Error ? err.message : 'Connection failed',
    }
  }
}
