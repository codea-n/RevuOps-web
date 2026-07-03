import { createClient } from '@/lib/supabase/server'

const MONTHLY_LIMIT = 20

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
  const percent = Math.min((used / MONTHLY_LIMIT) * 100, 100)
  const remaining = Math.max(MONTHLY_LIMIT - used, 0)

  const barColor = percent >= 100
    ? 'bg-red-500'
    : percent >= 80
    ? 'bg-yellow-500'
    : 'bg-green-500'

  const textColor = percent >= 100
    ? 'text-red-400'
    : percent >= 80
    ? 'text-yellow-400'
    : 'text-white/50'

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-white/70'>Monthly Reviews</span>
        <span className={`text-sm font-medium ${textColor}`}>
          {used} / {MONTHLY_LIMIT}
        </span>
      </div>

      {/* Progress bar */}
      <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Status message */}
      <p className={`text-xs ${textColor}`}>
        {percent >= 100
          ? 'Monthly limit reached. Reviews are paused until next month.'
          : percent >= 80
          ? `Only ${remaining} review${remaining === 1 ? '' : 's'} remaining this month.`
          : `${remaining} review${remaining === 1 ? '' : 's'} remaining this month.`}
      </p>
    </div>
  )
}