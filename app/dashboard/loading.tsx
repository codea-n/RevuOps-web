import { Card, CardContent, CardHeader } from '@/components/ui/card'

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-md ${className ?? ''}`} />
  )
}

export default function DashboardLoading() {
  return (
    <main className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-5xl mx-auto flex flex-col gap-8'>

        {/* Header skeleton */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-10 w-40' />
        </div>

        {/* Stats skeleton */}
        <div className='grid grid-cols-3 gap-4'>
          {[1, 2, 3].map(i => (
            <Card key={i} className='bg-zinc-900 border-white/10'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-24' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-10 w-16' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reviews skeleton */}
        <Card className='bg-zinc-900 border-white/10'>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='flex items-center justify-between py-3 border-b border-white/5'>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-6 w-16 rounded-full' />
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}