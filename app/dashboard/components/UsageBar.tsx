import { createClient } from '@/lib/supabase/server'

async function getMonthlyUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  return count ?? 0
}

export default async function UsageBar({ userId }: { userId: string }) {
  const used = await getMonthlyUsage(userId)

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-white/70'>Reviews This Month</span>
        <span className='text-sm font-medium text-white/50'>{used}</span>
      </div>
      <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
        <div
          className='h-full rounded-full bg-green-500 transition-all'
          style={{ width: `${Math.min((used / 50) * 100, 100)}%` }}
        />
      </div>
      <p className='text-xs text-white/30'>
        {used} review{used !== 1 ? 's' : ''} posted this month
      </p>
    </div>
  )
}