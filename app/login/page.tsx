'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'

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
    <div className='min-h-screen bg-background flex flex-col'>

      {/* Nav */}
      <header className='border-b border-border'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link href='/' className='font-semibold tracking-tight text-foreground'>
            RevuOps
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Login card */}
      <main className='flex-1 flex items-center justify-center px-6 py-12'>
        <Card className='w-full max-w-sm border-border shadow-none'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='text-xl font-semibold'>Welcome back</CardTitle>
            <CardDescription className='text-muted-foreground'>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Button
              onClick={signInWithGitHub}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium'
            >
              Continue with GitHub
            </Button>
            <p className='text-xs text-center text-muted-foreground'>
              See you back soon!
            </p>
          </CardContent>
        </Card>
      </main>

    </div>
  )
}