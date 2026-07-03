'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
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
    // Count seconds so user sees "Waking up... (8s)"
    const counter = setInterval(() => {
      setSecondsWaited(s => s + 1)
    }, 1000)

    // After 4 seconds still loading → honest cold start message
    const slowTimer = setTimeout(() => {
      setStatus(s => s === 'loading' ? 'slow' : s)
    }, 4000)

    fetch(`${apiUrl}/github/repos?user_id=${userId}`)
      .then(res => res.ok ? res.json() : { repos: [] })
      .then(data => {
        setRepos(data.repos || [])
        setStatus('done')
      })
      .catch(() => {
        setStatus('error')
        setRepos([])
      })
      .finally(() => {
        clearTimeout(slowTimer)
        clearInterval(counter)
      })

    return () => {
      clearTimeout(slowTimer)
      clearInterval(counter)
    }
  }, [userId, apiUrl])

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center gap-2 py-8'>
        <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin' />
        <p className='text-white/40 text-sm'>Loading repositories…</p>
      </div>
    )
  }

  if (status === 'slow') {
    return (
      <div className='flex flex-col items-center gap-2 py-8'>
        <div className='w-5 h-5 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin' />
        <p className='text-yellow-400/70 text-sm'>
          Waking up backend… ({secondsWaited}s)
        </p>
        <p className='text-white/30 text-xs'>
          Free tier cold start — usually under 30s
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className='text-white/40 text-sm text-center py-4'>
        Could not reach backend. Try refreshing.
      </p>
    )
  }

  if (repos.length === 0) {
    return (
      <p className='text-white/40 text-sm text-center py-4'>
        No repositories connected yet.{' '}
        <a href={installUrl} className='text-white underline'>
          Connect one now
        </a>
      </p>
    )
  }

  return (
    <>
      {repos.map((repo: Repo) => (
        <div key={repo.id}
          className='flex items-center justify-between py-3 border-b border-white/5 last:border-0'>
          <span className='text-sm font-medium'>{repo.repo_full_name}</span>
          <Badge variant='outline' className='border-green-500/40 text-green-400'>
            Active
          </Badge>
        </div>
      ))}
    </>
  )
}