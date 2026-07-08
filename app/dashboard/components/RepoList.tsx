'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Repo } from '@/app/dashboard/types'

interface RepoListProps {
  userId: string
  installUrl: string
  apiUrl: string
}

export default function RepoList({ userId, installUrl, apiUrl }: RepoListProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [status, setStatus] = useState<'loading' | 'slow' | 'done' | 'error'>('loading')
  const [secondsWaited, setSecondsWaited] = useState(0)

  useEffect(() => {
    const counter = setInterval(() => {
      setSecondsWaited(s => s + 1)
    }, 1000)

    const slowTimer = setTimeout(() => {
      setStatus(s => s === 'loading' ? 'slow' : s)
    }, 4000)

    async function fetchRepos() {
      try {
        // Get session token from browser — client component has access to it
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setStatus('error')
          return
        }

        const res = await fetch(`${apiUrl}/github/repos`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          signal: AbortSignal.timeout(60000),
        })

        if (!res.ok) {
          setStatus('error')
          return
        }

        const data = await res.json()
        setRepos(data.repos || [])
        setStatus('done')
      } catch {
        setStatus('error')
        setRepos([])
      } finally {
        clearTimeout(slowTimer)
        clearInterval(counter)
      }
    }

    fetchRepos()

    return () => {
      clearTimeout(slowTimer)
      clearInterval(counter)
    }
  }, [userId, apiUrl])

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center gap-2 py-8'>
        <div className='w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin' />
        <p className='text-muted-foreground text-sm'>Loading repositories…</p>
      </div>
    )
  }

  if (status === 'slow') {
    return (
      <div className='flex flex-col items-center gap-2 py-8'>
        <div className='w-5 h-5 border-2 border-muted border-t-yellow-500 rounded-full animate-spin' />
        <p className='text-yellow-600 dark:text-yellow-400 text-sm'>
          Waking up backend… ({secondsWaited}s)
        </p>
        <p className='text-xs text-muted-foreground'>
          Usually connects in under 50s
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className='text-muted-foreground text-sm text-center py-4'>
        Could not reach backend. Try refreshing.
      </p>
    )
  }

  if (repos.length === 0) {
    return (
      <p className='text-muted-foreground text-sm text-center py-4'>
        No repositories connected yet.{' '}
        <a href={installUrl} className='text-primary underline'>
          Connect one now
        </a>
      </p>
    )
  }

  return (
    <>
      {repos.map((repo: Repo) => (
        <div key={repo.id}
          className='flex items-center justify-between py-3 border-b border-border last:border-0'>
          <span className='text-sm font-medium text-foreground'>{repo.repo_full_name}</span>
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'>
            Active
          </Badge>
        </div>
      ))}
    </>
  )
}