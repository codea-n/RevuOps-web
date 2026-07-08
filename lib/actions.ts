'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerInstallation(
  installationId: string,
  accountLogin: string
) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/install`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      installation_id: parseInt(installationId),
      account_login: accountLogin,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to register installation: ${error}`)
  }

  return res.json()
}

export async function getUserRepos() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { repos: [] }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/github/repos`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return { repos: [] }
    return res.json()
  } catch {
    return { repos: [] }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}