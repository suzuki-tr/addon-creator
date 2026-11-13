import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface StatusRow {
  key: 'health' | 'attackDamage' | 'movementSpeed' | 'scale'
  emoji: string
  labelKey:
    | 'entity.status.health'
    | 'entity.status.attackDamage'
    | 'entity.status.movementSpeed'
    | 'entity.status.scale'
  defaultValue: number
  min: number
  max: number
  step: number
}

const STATUS_ROWS: StatusRow[] = [
  {
    key: 'health',
    emoji: '❤️',
    labelKey: 'entity.status.health',
    defaultValue: 20,
    min: 1,
    max: 2048,
    step: 1,
  },
  {
    key: 'attackDamage',
    emoji: '⚔️',
    labelKey: 'entity.status.attackDamage',
    defaultValue: 3,
    min: 0,
    max: 50,
    step: 0.5,
  },
  {
    key: 'movementSpeed',
    emoji: '👟',
    labelKey: 'entity.status.movementSpeed',
    defaultValue: 0.25,
    min: 0.01,
    max: 1.0,
    step: 0.01,
  },
  {
    key: 'scale',
    emoji: '📐',
    labelKey: 'entity.status.scale',
    defaultValue: 1.0,
    min: 0.1,
    max: 5.0,
    step: 0.1,
  },
]

type StatusKey = StatusRow['key']
type StatusValues = Record<StatusKey, number>

const DEFAULT_VALUES: StatusValues = {
  health: 20,
  attackDamage: 3,
  movementSpeed: 0.25,
  scale: 1.0,
}

export const StatusPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const [values, setValues] = useState<StatusValues>({ ...DEFAULT_VALUES })

  const handleChange = (row: StatusRow, raw: number): void => {
    if (isNaN(raw)) return
    const clamped = Math.min(Math.max(raw, row.min), row.max)
    setValues((prev) => ({ ...prev, [row.key]: clamped }))
  }

  const handleReset = (key: StatusKey): void => {
    setValues((prev) => ({ ...prev, [key]: DEFAULT_VALUES[key] }))
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        {t('editor.status.heading')}
      </h2>
      <div className="flex flex-col gap-4">
        {STATUS_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-lg bg-white"
          >
            <span
              className="text-xl w-7 flex-shrink-0 text-center"
              aria-hidden="true"
            >
              {row.emoji}
            </span>
            <span className="text-sm font-medium text-gray-700 w-28 flex-shrink-0">
              {t(row.labelKey)}
            </span>
            <input
              type="range"
              min={row.min}
              max={row.max}
              step={row.step}
              value={values[row.key]}
              onChange={(e) => handleChange(row, parseFloat(e.target.value))}
              className="flex-1 cursor-pointer accent-[#5D9C3B]"
              aria-label={t(row.labelKey)}
            />
            <input
              type="number"
              min={row.min}
              max={row.max}
              step={row.step}
              value={values[row.key]}
              onChange={(e) => handleChange(row, parseFloat(e.target.value))}
              className="w-20 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              aria-label={t(row.labelKey)}
            />
            <button
              type="button"
              onClick={() => handleReset(row.key)}
              className="flex-shrink-0 border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
            >
              {t('editor.status.resetDefault')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
