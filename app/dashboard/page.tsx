import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { registerInstallation, getUserRepos } from '@/lib/actions'
import type { Repo, Review } from './types.ts'


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ installation_id?: string; setup_action?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get GitHub username from user metadata
  const githubUsername = user.user_metadata?.user_name || ''

  // Handle GitHub App install redirect
  // When GitHub redirects back, it adds ?installation_id=123&setup_action=install
  const params = await searchParams
  console.log('Dashboard params:', JSON.stringify(params))
  
  if (params.installation_id) {
    console.log('Installation detected:', params.installation_id)
    try {
      await registerInstallation(
        params.installation_id,
        user.id,
        githubUsername
      )
      console.log('Registration successful')
    } catch (e) {
      console.error('Failed to register installation:', e)
    }
    redirect('/dashboard')
  }


  // Fetch reviews and repos in parallel
  const [{ data: reviews }, { repos }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    getUserRepos(user.id),
  ])

  const stats = {
    total: reviews?.length ?? 0,
    approved: reviews?.filter(r => r.review_text?.includes('APPROVE')).length ?? 0,
    flagged: reviews?.filter(r => !r.review_text?.includes('APPROVE')).length ?? 0,
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
          <a href={installUrl}>
            <Button className='bg-white text-black hover:bg-white/90 font-semibold'>
              + Connect Repository
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4'>
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
            {repos && repos.length > 0 ? repos.map((repo: Repo) => (
              <div key={repo.id}
                className='flex items-center justify-between py-3 border-b border-white/5 last:border-0'>
                <span className='text-sm font-medium'>{repo.repo_full_name}</span>
                <Badge variant='outline' className='border-green-500/40 text-green-400'>
                  Active
                </Badge>
              </div>
            )) : (
              <p className='text-white/40 text-sm text-center py-4'>
                No repositories connected yet.{' '}
                <a href={installUrl} className='text-white underline'>
                  Connect one now
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className='bg-zinc-900 border-white/10 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {reviews && reviews.length > 0 ? reviews.map((review: Review) => (
              <div key={review.id}
                className='flex items-center justify-between py-3 border-b border-white/5 last:border-0'>
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
              </div>
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