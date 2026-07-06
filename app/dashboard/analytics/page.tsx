import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import ReviewsChart from './components/ReviewsChart'
import type { Review } from '@/app/dashboard/types'
import ThemeToggle from '@/app/components/ThemeToggle'

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - date.getDay())
  return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildWeeklyData(reviews: Review[]) {
  const map: Record<string, { week: string; approved: number; flagged: number }> = {}
  reviews.forEach(r => {
    const week = getWeekLabel(r.created_at)
    if (!map[week]) map[week] = { week, approved: 0, flagged: 0 }
    if (r.review_text?.includes('APPROVE')) map[week].approved++
    else map[week].flagged++
  })
  return Object.values(map).slice(-8)
}

function buildRepoStats(reviews: Review[]) {
  const map: Record<string, { repo: string; total: number; flagged: number }> = {}
  reviews.forEach(r => {
    if (!map[r.repo]) map[r.repo] = { repo: r.repo, total: 0, flagged: 0 }
    map[r.repo].total++
    if (!r.review_text?.includes('APPROVE')) map[r.repo].flagged++
  })
  return Object.values(map).sort((a, b) => b.total - a.total)
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allReviews = (reviews ?? []) as Review[]
  const total = allReviews.length
  const approved = allReviews.filter(r => r.review_text?.includes('APPROVE')).length
  const flagged = total - approved
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
  const weeklyData = buildWeeklyData(allReviews)
  const repoStats = buildRepoStats(allReviews)
  const thisMonth = allReviews.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className='min-h-screen bg-background'>

      {/* Nav */}
      <header className='border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-8'>
            <Link href='/' className='font-semibold tracking-tight text-foreground'>RevuOps</Link>
            <nav className='hidden md:flex items-center gap-6'>
              <Link href='/dashboard'
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                Overview
              </Link>
              <Link href='/dashboard/analytics'
                className='text-sm font-medium text-foreground border-b-2 border-primary pb-0.5'>
                Analytics
              </Link>
              <Link href='/status'
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                Status
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8'>

        {/* Page title */}
        <div>
          <h1 className='text-2xl font-semibold text-foreground'>Analytics</h1>
          <p className='text-sm text-muted-foreground mt-1'>Your code review insights</p>
        </div>

        {/* Top stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { label: 'Total reviews', value: total },
            { label: 'Approved', value: approved },
            { label: 'Flagged', value: flagged },
            { label: 'Approval rate', value: `${approvalRate}%` },
          ].map(({ label, value }) => (
            <Card key={label} className='border-border shadow-none'>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{label}</p>
                <p className='text-3xl font-semibold text-foreground mt-1'>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary stats */}
        <div className='grid md:grid-cols-2 gap-4'>
          <Card className='border-border shadow-none'>
            <CardContent className='pt-6'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Most active repo</p>
              <p className='text-lg font-medium text-foreground mt-1'>{repoStats[0]?.repo ?? '—'}</p>
            </CardContent>
          </Card>
          <Card className='border-border shadow-none'>
            <CardContent className='pt-6'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Reviews this month</p>
              <p className='text-3xl font-semibold text-foreground mt-1'>{thisMonth}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className='border-border shadow-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Reviews over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ReviewsChart data={weeklyData} />
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>
                Not enough data yet. Open more PRs to see trends.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Repo breakdown */}
        <Card className='border-border shadow-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              By repository
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {repoStats.length > 0 ? repoStats.map(repo => (
              <div key={repo.repo}
                className='flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-sm font-medium text-foreground'>{repo.repo}</span>
                  <span className='text-xs text-muted-foreground'>
                    {repo.total} review{repo.total !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className='flex items-center gap-3 text-xs'>
                  <span className='text-green-600 dark:text-green-400 font-medium'>
                    {repo.total - repo.flagged} approved
                  </span>
                  {repo.flagged > 0 && (
                    <span className='text-red-600 dark:text-red-400 font-medium'>
                      {repo.flagged} flagged
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <p className='text-sm text-muted-foreground text-center py-8'>No data yet.</p>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}