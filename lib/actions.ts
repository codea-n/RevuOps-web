'use server'

export async function registerInstallation(
  installationId: string,
  userId: string,
  accountLogin: string
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      installation_id: parseInt(installationId),
      user_id: userId,
      account_login: accountLogin,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to register installation')
  }

  return res.json()
}

export async function getUserRepos(userId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/github/repos?user_id=${userId}`
  )
  if (!res.ok) return { repos: [] }
  return res.json()
}