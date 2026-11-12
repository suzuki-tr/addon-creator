import type { JSX } from 'react'

export interface TraitCardData {
  id: string
  icon: string
  name: string
  description: string
}

interface TraitCardProps {
  trait: TraitCardData
  checked: boolean
  onToggle: (id: string) => void
}

export const TraitCard = ({
  trait,
  checked,
  onToggle,
}: TraitCardProps): JSX.Element => {
  const handleClick = (): void => {
    onToggle(trait.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle(trait.id)
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'border rounded-lg p-3.5 cursor-pointer flex flex-col gap-2 select-none transition-colors',
        checked
          ? 'border-[#5D9C3B] bg-[#F0F8EA]'
          : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {/* Checkbox indicator */}
        <div
          className={[
            'w-4.5 h-4.5 rounded flex items-center justify-center text-xs flex-shrink-0',
            checked
              ? 'bg-[#5D9C3B] border-2 border-[#5D9C3B] text-white'
              : 'bg-white border-2 border-gray-300',
          ].join(' ')}
          style={{ width: 18, height: 18 }}
        >
          {checked && '✓'}
        </div>

        {/* Trait icon */}
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-base flex-shrink-0">
          {trait.icon}
        </div>

        {/* Trait name */}
        <span className="text-sm font-semibold text-gray-900 flex-1">
          {trait.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-snug pl-6">{trait.description}</p>
    </div>
  )
}
