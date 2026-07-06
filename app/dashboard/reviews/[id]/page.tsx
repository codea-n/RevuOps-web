import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { SecurityIssue, PerformanceHotspot, ArchitectureNote } from '@/app/dashboard/types'
import ThemeToggle from '@/app/components/ThemeToggle'

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !review) {
    return (
      <div className='min-h-screen bg-background'>
        <header className='border-b border-border'>
          <div className='max-w-4xl mx-auto px-6 h-14 flex items-center justify-between'>
            <Link href='/dashboard' className='font-semibold tracking-tight text-foreground'>RevuOps</Link>
            <ThemeToggle />
          </div>
        </header>
        <main className='max-w-4xl mx-auto px-6 py-12'>
          <p className='text-muted-foreground'>Review not found.</p>
          <Link href='/dashboard' className='mt-4 inline-block'>
            <Button variant='outline' size='sm'>← Back to dashboard</Button>
          </Link>
        </main>
      </div>
    )
  }

  const isApproved = review.review_text?.includes('APPROVE')
  const security = review.security_findings || {}
  const performance = review.performance_findings || {}
  const architecture = review.architecture_findings || {}

  return (
    <div className='min-h-screen bg-background'>

      {/* Nav */}
      <header className='border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10'>
        <div className='max-w-4xl mx-auto px-6 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-6'>
            <Link href='/' className='font-semibold tracking-tight text-foreground'>RevuOps</Link>
            <Link href='/dashboard' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              ← Dashboard
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6'>

        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-xl font-semibold text-foreground'>
              {review.repo}
            </h1>
            <p className='text-sm text-muted-foreground'>
              PR #{review.pr_number} · {new Date(review.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <Badge
            variant='outline'
            className={isApproved
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'}>
            {isApproved ? 'Approved' : 'Flagged'}
          </Badge>
        </div>

        {/* Review text */}
        <Card className='border-border shadow-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Review summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm leading-relaxed text-foreground whitespace-pre-wrap'>
              {review.review_text}
            </p>
          </CardContent>
        </Card>

        {/* Security findings */}
        {security.issues?.length > 0 && (
          <Card className='border-red-200 dark:border-red-900 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400'>
                Security findings
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {security.issues.map((issue: SecurityIssue, i: number) => (
                <div key={i}
                  className='flex items-start justify-between px-6 py-3 border-b border-border last:border-0'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm text-foreground'>{issue.message}</p>
                    <p className='text-xs text-muted-foreground'>Line {issue.line}</p>
                  </div>
                  <Badge variant='outline'
                    className='border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 ml-4 shrink-0'>
                    {issue.code || issue.rule_code}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Performance findings */}
        {performance.hotspots?.length > 0 && (
          <Card className='border-yellow-200 dark:border-yellow-900 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-medium uppercase tracking-wide text-yellow-600 dark:text-yellow-400'>
                Performance hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {performance.hotspots.map((hotspot: PerformanceHotspot, i: number) => (
                <div key={i} className='px-6 py-3 border-b border-border last:border-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-sm font-medium text-foreground'>{hotspot.function}</span>
                    <span className='text-xs text-muted-foreground'>Line {hotspot.line}</span>
                  </div>
                  {hotspot.issues.map((issue: string, j: number) => (
                    <p key={j} className='text-sm text-muted-foreground'>· {issue}</p>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Architecture notes */}
        {architecture.notes?.length > 0 && (
          <Card className='border-blue-200 dark:border-blue-900 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400'>
                Architecture notes
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {architecture.notes.map((note: ArchitectureNote, i: number) => (
                <div key={i} className='px-6 py-3 border-b border-border last:border-0'>
                  <p className='text-sm text-foreground'>{note.type}</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>{note.context}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className='text-xs text-muted-foreground text-center'>
          Reviewed by {review.model_version} · RevuOps
        </p>

      </main>
    </div>
  )
}