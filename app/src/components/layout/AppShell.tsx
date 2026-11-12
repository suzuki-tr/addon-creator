import type { JSX, ReactNode } from 'react'
import { Header } from './Header'

interface AppShellProps {
  children: ReactNode
  /**
   * When true, removes the max-width container and padding from the main area.
   * Use this for full-bleed layouts like the editor page.
   */
  noPadding?: boolean
}

export const AppShell = ({
  children,
  noPadding = false,
}: AppShellProps): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      {noPadding ? (
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </main>
      ) : (
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
          {children}
        </main>
      )}
    </div>
  )
}
