import type { JSX, ReactNode } from 'react'
import { Header } from './Header'

interface AppShellProps {
  children: ReactNode
}

export const AppShell = ({ children }: AppShellProps): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
