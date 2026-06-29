import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <nav className='flex items-center justify-between px-8 py-5 border-b border-white/10'>
        <span className='font-bold text-lg tracking-tight'>AutoReviewer</span>
        <Link href='/login'>
          <Button variant='outline' className='border-white/20 text-white hover:bg-white/10'>
            Sign in
          </Button>
        </Link>
      </nav>
      <section className='flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 gap-6'>
        <Badge variant='outline' className='border-white/20 text-white/60 text-xs'>
          Multi-agent ? RAG ? GitHub Native
        </Badge>
        <h1 className='text-5xl md:text-7xl font-bold tracking-tight max-w-3xl'>
          AI Code Reviews in Under 30 Seconds
        </h1>
        <p className='text-white/50 text-lg max-w-xl'>
          AutoReviewer runs security, performance, and architecture analysis
          on every pull request ? automatically, the moment you open it.
        </p>
        <div className='flex gap-3 mt-4'>
          <Link href='/login'>
            <Button size='lg' className='bg-white text-black hover:bg-white/90 font-semibold'>
              Get started free
            </Button>
          </Link>
          <a href='https://github.com/YOUR_GITHUB_USERNAME/reviewer-agent' target='_blank'>
            <Button size='lg' variant='outline' className='border-white/20 text-white hover:bg-white/10'>
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
      <section className='max-w-4xl mx-auto px-8 pb-32 grid md:grid-cols-3 gap-8'>
        {[
          { step: '01', title: 'Connect your repo', desc: 'Install AutoReviewer on any GitHub repository in one click.' },
          { step: '02', title: 'Open a pull request', desc: 'AutoReviewer triggers instantly on every new PR, no configuration needed.' },
          { step: '03', title: 'Get your review', desc: 'Security, performance, and architecture findings posted as a PR comment in seconds.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className='flex flex-col gap-3 p-6 rounded-xl border border-white/10'>
            <span className='text-white/30 text-sm font-mono'>{step}</span>
            <h3 className='font-semibold text-lg'>{title}</h3>
            <p className='text-white/50 text-sm leading-relaxed'>{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}