import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>

      {/* Nav */}
      <header className='border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <span className='font-semibold tracking-tight'>RevuOps</span>
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <Link href='/login'>
              <Button size='sm' variant='outline'>Sign in</Button>
            </Link>
            <Link href='/login'>
              <Button size='sm' className='bg-primary text-primary-foreground hover:bg-primary/90'>
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='max-w-4xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center gap-6'>
        <span className='text-xs font-medium uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-full'>
          Multi-agent · RAG · GitHub Native
        </span>
        <h1 className='text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-tight'>
          AI code reviews<br />in under 30 seconds
        </h1>
        <p className='text-lg text-muted-foreground max-w-xl leading-relaxed'>
          RevuOps runs security, performance, and architecture analysis
          on every pull request — automatically, the moment you open it.
        </p>
        <div className='flex items-center gap-3 mt-2'>
          <Link href='/login'>
            <Button size='lg' className='bg-primary text-primary-foreground hover:bg-primary/90 font-medium'>
              Get started free
            </Button>
          </Link>
          <a href='https://github.com/YOUR_GITHUB_USERNAME/reviewer-agent' target='_blank' rel='noreferrer'>
            <Button size='lg' variant='outline'>
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className='max-w-4xl mx-auto px-6 pb-24'>
        <p className='text-xs font-medium uppercase tracking-widest text-muted-foreground text-center mb-10'>
          How it works
        </p>
        <div className='grid md:grid-cols-3 gap-6'>
          {[
            {
              step: '01',
              title: 'Connect your repo',
              desc: 'Install RevuOps on any GitHub repository in one click. No configuration needed.',
            },
            {
              step: '02',
              title: 'Open a pull request',
              desc: 'RevuOps triggers instantly on every new PR the moment it is opened.',
            },
            {
              step: '03',
              title: 'Get your review',
              desc: 'Security, performance, and architecture findings posted as a PR comment in seconds.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step}
              className='flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors'>
              <span className='text-xs font-mono font-medium text-primary'>{step}</span>
              <h3 className='font-medium text-foreground'>{title}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>RevuOps</span>
          <div className='flex items-center gap-6'>
            <Link href='/status' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              Status
            </Link>
            <a href='https://github.com/YOUR_GITHUB_USERNAME/reviewer-agent'
              target='_blank' rel='noreferrer'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}