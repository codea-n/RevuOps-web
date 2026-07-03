import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { registerInstallation, signOut } from '@/lib/actions'
import Link from 'next/link'
import type { Review } from '@/app/dashboard/types'
import RepoList from './components/RepoList'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ installation_id?: string; setup_action?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const githubUsername = user.user_metadata?.user_name || ''

  const params = await searchParams
  if (params.installation_id) {
    try {
      await registerInstallation(
        params.installation_id,
        user.id,
        githubUsername
      )
    } catch (e) {
      console.error('Failed to register installation:', e)
    }
    redirect('/dashboard')
  }

  const { data: reviews }= await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

  const stats = {
    total: reviews?.length ?? 0,
    approved: reviews?.filter((r: Review) => r.review_text?.includes('APPROVE')).length ?? 0,
    flagged: reviews?.filter((r: Review) => !r.review_text?.includes('APPROVE')).length ?? 0,
  }

  const installUrl = `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new`

  return (
    <main className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-5xl mx-auto flex flex-col gap-8'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Dashboard</h1>
            <p className='text-white/50 text-sm mt-1'>{user.email}</p>
          </div>
          <div className='flex items-center gap-3'>
            <a href={installUrl}>
              <Button className='bg-white text-black hover:bg-white/90 font-semibold'>
                + Connect Repository
              </Button>
            </a>
            <form action={signOut}>
              <Button
                type='submit'
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10'>
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            { label: 'Total Reviews', value: stats.total },
            { label: 'Approved', value: stats.approved },
            { label: 'Flagged', value: stats.flagged },
          ].map(({ label, value }) => (
            <Card key={label} className='bg-zinc-900 border-white/10 text-white'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-white/50'>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className='text-3xl font-bold'>{value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connected Repos */}
        <Card className='bg-zinc-900 border-white/10 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Connected Repositories</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <RepoList
              userId={user.id}
              installUrl={installUrl}
              apiUrl={process.env.NEXT_PUBLIC_API_URL!}
              />
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className='bg-zinc-900 border-white/10 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {reviews && reviews.length > 0 ? reviews.map((review: Review) => (
              <Link
                key={review.id}
                href={`/dashboard/reviews/${review.id}`}
                className='flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors cursor-pointer'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-medium'>
                    {review.repo} — PR #{review.pr_number}
                  </span>
                  <span className='text-xs text-white/40'>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className={review.review_text?.includes('APPROVE')
                    ? 'border-green-500/40 text-green-400'
                    : 'border-red-500/40 text-red-400'}>
                  {review.review_text?.includes('APPROVE') ? 'Approved' : 'Flagged'}
                </Badge>
              </Link>
            )) : (
              <p className='text-white/40 text-sm text-center py-8'>
                No reviews yet. Connect a repository to get started.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}