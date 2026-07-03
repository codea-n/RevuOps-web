import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { SecurityIssue, PerformanceHotspot, ArchitectureNote } from '@/app/dashboard/types'

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
      <main className='min-h-screen bg-black text-white p-8'>
        <div className='max-w-3xl mx-auto'>
          <Link href='/dashboard'>
            <Button variant='outline' className='border-white/20 text-white hover:bg-white/10 mb-6'>
              ← Back to Dashboard
            </Button>
          </Link>
          <p className='text-white/50'>Review not found.</p>
        </div>
      </main>
    )
  }

  const isApproved = review.review_text?.includes('APPROVE')
  const security = review.security_findings || {}
  const performance = review.performance_findings || {}
  const architecture = review.architecture_findings || {}

  return (
    <main className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-3xl mx-auto flex flex-col gap-6'>

        {/* Back button */}
        <Link href='/dashboard'>
          <Button variant='outline' className='border-white/20 text-white hover:bg-white/10 w-fit'>
            ← Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-bold'>
              {review.repo} — PR #{review.pr_number}
            </h1>
            <span className='text-white/40 text-sm'>
              {new Date(review.created_at).toLocaleString()}
            </span>
          </div>
          <Badge
            variant='outline'
            className={isApproved
              ? 'border-green-500/40 text-green-400'
              : 'border-red-500/40 text-red-400'}>
            {isApproved ? 'Approved' : 'Flagged'}
          </Badge>
        </div>

        {/* Full review text */}
        <Card className='bg-zinc-900 border-white/10 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Review Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-white/80 text-sm leading-relaxed whitespace-pre-wrap'>
              {review.review_text}
            </p>
          </CardContent>
        </Card>

        {/* Security findings */}
        {security.issues?.length > 0 && (
          <Card className='bg-zinc-900 border-red-500/20 text-white'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <span className='text-red-400'>⚠</span> Security Findings
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {security.issues.map((issue: SecurityIssue, i: number) => (
                <div key={i} className='flex flex-col gap-1 py-2 border-b border-white/5 last:border-0'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='border-red-500/40 text-red-400 text-xs'>
                      {issue.code || issue.rule_code}
                    </Badge>
                    <span className='text-xs text-white/40'>Line {issue.line}</span>
                  </div>
                  <p className='text-sm text-white/70'>{issue.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Performance findings */}
        {performance.hotspots?.length > 0 && (
          <Card className='bg-zinc-900 border-yellow-500/20 text-white'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <span className='text-yellow-400'>⚡</span> Performance Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {performance.hotspots.map((hotspot: PerformanceHotspot, i: number) => (
                <div key={i} className='flex flex-col gap-1 py-2 border-b border-white/5 last:border-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>{hotspot.function}</span>
                    <span className='text-xs text-white/40'>Line {hotspot.line}</span>
                  </div>
                  {hotspot.issues.map((issue: string, j: number) => (
                    <p key={j} className='text-sm text-white/70'>• {issue}</p>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Architecture findings */}
        {architecture.notes?.length > 0 && (
          <Card className='bg-zinc-900 border-blue-500/20 text-white'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <span className='text-blue-400'>🏗</span> Architecture Notes
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {architecture.notes.map((note: ArchitectureNote, i: number) => (
                <div key={i} className='py-2 border-b border-white/5 last:border-0'>
                  <p className='text-sm text-white/70'>{note.type}: {note.context}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Model info */}
        <p className='text-white/20 text-xs text-center'>
          Reviewed by {review.model_version} • RevuOps
        </p>

      </div>
    </main>
  )
}