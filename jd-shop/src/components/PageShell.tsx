import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

interface PageShellProps {
  children: ReactNode
  mainClassName?: string
  innerClassName?: string
  includeFooter?: boolean
  backgroundClass?: string
}

export default function PageShell({
  children,
  mainClassName = '',
  innerClassName = 'w-full',
  includeFooter = true,
  backgroundClass = 'bg-background-primary'
}: PageShellProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', backgroundClass)}>
      <Header />
      <main className={cn('flex-1 px-4 py-10 sm:px-6 sm:py-12', mainClassName)}>
        <div className={cn('mx-auto w-full', innerClassName)}>
          {children}
        </div>
      </main>
      {includeFooter && <Footer />}
    </div>
  )
}
