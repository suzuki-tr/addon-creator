import type { JSX } from 'react'

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const ResizeHandle = ({ onMouseDown }: ResizeHandleProps): JSX.Element => (
  <div
    className="w-1.5 cursor-col-resize hover:bg-[#5D9C3B] bg-transparent flex-shrink-0 select-none transition-colors self-stretch"
    onMouseDown={onMouseDown}
    role="separator"
    aria-label="Resize JSON preview panel"
    aria-orientation="vertical"
  />
)
