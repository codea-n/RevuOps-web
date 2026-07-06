import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'

async function checkBackend(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now()
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    return { ok: res.ok, latencyMs: Date.now() - start }
  } catch {
    return { ok: false, latencyMs: Date.now() - start }
  }
}

async function checkSupabase(): Promise<{ ok: boolean }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').select('id').limit(1)
    return { ok: !error }
  } catch {
    return { ok: false }
  }
}

async function getLastReview(): Promise<{ created_at: string } | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('reviews')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch {
    return null
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export default async function StatusPage() {
  const [backend, supabase, lastReview] = await Promise.all([
    checkBackend(),
    checkSupabase(),
    getLastReview(),
  ])

  const allOk = backend.ok && supabase.ok

  const services = [
    {
      name: 'Review API',
      description: 'FastAPI backend on Render',
      ok: backend.ok,
      detail: backend.ok ? `${backend.latencyMs}ms` : 'Unreachable',
    },
    {
      name: 'Database',
      description: 'Supabase PostgreSQL',
      ok: supabase.ok,
      detail: supabase.ok ? 'Connected' : 'Unreachable',
    },
  ]

  return (
    <div className='min-h-screen bg-background'>

      {/* Nav */}
      <header className='border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10'>
        <div className='max-w-3xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link href='/' className='font-semibold tracking-tight text-foreground'>RevuOps</Link>
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <Link href='/dashboard'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              Dashboard →
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-6 py-16 flex flex-col gap-8'>

        {/* Overall status */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-3'>
            <div className={`w-2.5 h-2.5 rounded-full ${allOk ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <h1 className='text-2xl font-semibold text-foreground'>
              {allOk ? 'All systems operational' : 'Service disruption'}
            </h1>
          </div>
          {lastReview && (
            <p className='text-sm text-muted-foreground pl-5'>
              Last review posted {timeAgo(lastReview.created_at)}
            </p>
          )}
        </div>

        {/* Services */}
        <div className='flex flex-col gap-3'>
          {services.map(service => (
            <Card key={service.name} className='border-border shadow-none'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-0.5'>
                    <CardTitle className='text-sm font-medium text-foreground'>
                      {service.name}
                    </CardTitle>
                    <p className='text-xs text-muted-foreground'>{service.description}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-xs text-muted-foreground'>{service.detail}</span>
                    <Badge variant='outline'
                      className={service.ok
                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'}>
                      {service.ok ? 'Operational' : 'Down'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <p className='text-xs text-muted-foreground text-center'>
          Updates every page load · RevuOps
        </p>

      </main>
    </div>
  )
}