import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/stores/projectStore'

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

export const ComponentPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { project, updateStatus } = useProjectStore()
  const [expandedId, setExpandedId] = useState<string | null>('health')
  const [healthMax, setHealthMax] = useState(project?.status.health ?? 20)

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
              <div className="px-3 py-3 bg-white border-t border-gray-100 flex flex-col gap-3">
                {/* Max health row */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 flex-shrink-0">
                    {t('editor.components.health.maxLabel')}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={2048}
                    step={1}
                    value={healthMax}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setHealthMax(v)
                      updateStatus('health', v)
                    }}
                    className="flex-1 cursor-pointer accent-[#5D9C3B]"
                    aria-label={t('editor.components.health.maxLabel')}
                  />
                  <input
                    type="number"
                    min={1}
                    max={2048}
                    step={1}
                    value={healthMax}
                    onChange={(e) => {
                      const v = Math.min(2048, Math.max(1, Number(e.target.value)))
                      if (!isNaN(v)) {
                        setHealthMax(v)
                        updateStatus('health', v)
                      }
                    }}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                    aria-label={t('editor.components.health.maxLabel')}
                  />
                </div>
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
