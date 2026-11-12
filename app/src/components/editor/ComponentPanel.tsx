import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ComponentItem {
  id: string
  name: string
}

const COMPONENTS: ComponentItem[] = [
  { id: 'health', name: 'minecraft:health' },
  { id: 'attack', name: 'minecraft:attack' },
  { id: 'movement', name: 'minecraft:movement' },
  { id: 'melee_attack', name: 'minecraft:behavior.melee_attack' },
]

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
}

const SliderRow = ({ label, value, min, max }: SliderRowProps): JSX.Element => {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-gray-600 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 relative h-2 rounded-full bg-gray-200">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[#5D9C3B]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#5D9C3B] shadow"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <span className="text-xs text-gray-700 w-8 text-right font-mono">
        {value}
      </span>
    </div>
  )
}

export const ComponentPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>('health')

  const handleToggle = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-1">
      {COMPONENTS.map((comp) => {
        const isExpanded = expandedId === comp.id

        return (
          <div
            key={comp.id}
            className="border border-gray-200 rounded-md overflow-hidden"
          >
            {/* Accordion header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleToggle(comp.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToggle(comp.id)
                }
              }}
              className={[
                'flex items-center justify-between px-3 py-2 cursor-pointer select-none',
                isExpanded
                  ? 'bg-[#F0F8EA] text-[#5D9C3B]'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-xs font-mono font-medium">{comp.name}</span>
              <span
                className={[
                  'text-xs transition-transform',
                  isExpanded ? 'rotate-180' : '',
                ].join(' ')}
              >
                ▼
              </span>
            </div>

            {/* Expanded body — only shown for health */}
            {isExpanded && comp.id === 'health' && (
              <div className="px-3 py-2 bg-white border-t border-gray-100">
                <SliderRow label="体力 (max)" value={20} min={1} max={100} />
                <SliderRow label="初期値" value={20} min={1} max={100} />
              </div>
            )}
          </div>
        )
      })}

      {/* Add component button */}
      <button
        type="button"
        className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-md py-2.5 text-sm text-gray-500 hover:border-[#5D9C3B] hover:text-[#5D9C3B] cursor-pointer bg-transparent transition-colors"
      >
        {t('editor.components.addButton')}
      </button>
    </div>
  )
}
