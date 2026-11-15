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
    // h-screen + overflow-hidden bound the layout to the viewport height so that
    // flex-1 / overflow-y-auto children can create true contained scroll regions.
    // min-h-screen would let the container grow past the viewport, breaking the chain.
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <Header />
      {noPadding ? (
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </main>
      ) : (
        // overflow-y-auto lets regular (non-editor) pages scroll their own content
        <main className="flex-1 overflow-y-auto max-w-[1200px] w-full mx-auto px-6 py-8">
          {children}
        </main>
      )}
    </div>
  )
}
