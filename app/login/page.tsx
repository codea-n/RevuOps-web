'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo read:user user:email',
      },
    })
  }

  return (
    <main className='min-h-screen bg-black flex items-center justify-center'>
      <Card className='w-full max-w-sm bg-zinc-900 border-white/10 text-white'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>AutoReviewer</CardTitle>
          <CardDescription className='text-white/50'>
            Sign in to connect your repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGitHub}
            className='w-full bg-white text-black hover:bg-white/90 font-semibold'
          >
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
