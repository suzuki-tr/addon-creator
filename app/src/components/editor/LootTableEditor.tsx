import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LootEntry {
  id: string
  type: 'item' | 'loot_table'
  name: string
  weight: number
  count: number
}

interface LootPool {
  id: string
  rollsMin: number
  rollsMax: number
  entries: LootEntry[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const nextId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const createEntry = (): LootEntry => ({
  id: nextId(),
  type: 'item',
  name: '',
  weight: 1,
  count: 1,
})

const createPool = (): LootPool => ({
  id: nextId(),
  rollsMin: 1,
  rollsMax: 1,
  entries: [createEntry()],
})

// ---------------------------------------------------------------------------
// LootTableEditor
// ---------------------------------------------------------------------------

export const LootTableEditor = (): JSX.Element => {
  const { t } = useTranslation()

  const [pools, setPools] = useState<LootPool[]>(() => {
    const p = createPool()
    return [p]
  })
  const [expandedPoolIds, setExpandedPoolIds] = useState<Set<string>>(
    () => new Set(pools.map((p) => p.id)),
  )

  const handleTogglePool = (id: string): void => {
    setExpandedPoolIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAddPool = (): void => {
    const pool = createPool()
    setPools((prev) => [...prev, pool])
    setExpandedPoolIds((prev) => new Set([...prev, pool.id]))
  }

  const handleDeletePool = (id: string): void => {
    setPools((prev) => prev.filter((p) => p.id !== id))
    setExpandedPoolIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handlePoolRollsChange = (
    id: string,
    field: 'rollsMin' | 'rollsMax',
    value: number,
  ): void => {
    setPools((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  const handleAddEntry = (poolId: string): void => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? { ...p, entries: [...p.entries, createEntry()] }
          : p,
      ),
    )
  }

  const handleDeleteEntry = (poolId: string, entryId: string): void => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? { ...p, entries: p.entries.filter((e) => e.id !== entryId) }
          : p,
      ),
    )
  }

  const handleEntryUpdate = (
    poolId: string,
    entryId: string,
    patch: Partial<LootEntry>,
  ): void => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? {
              ...p,
              entries: p.entries.map((e) =>
                e.id === entryId ? { ...e, ...patch } : e,
              ),
            }
          : p,
      ),
    )
  }

  return (
    <div className="p-4 space-y-3">
      {pools.map((pool, poolIdx) => {
        const isExpanded = expandedPoolIds.has(pool.id)

        return (
          <div
            key={pool.id}
            className="border border-[#E5E7EB] rounded-lg overflow-hidden"
          >
            {/* Pool header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleTogglePool(pool.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTogglePool(pool.id)
                }
              }}
              className={[
                'flex items-center justify-between px-4 py-3 cursor-pointer select-none',
                isExpanded
                  ? 'bg-[#F0F8EA] text-[#5D9C3B]'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-sm font-medium">
                {t('lootTable.pool')} {poolIdx + 1}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {pool.rollsMin}–{pool.rollsMax} {t('lootTable.rolls')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePool(pool.id)
                  }}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-0.5 bg-white cursor-pointer"
                >
                  {t('lootTable.deletePool')}
                </button>
                <span
                  className={[
                    'text-xs transition-transform',
                    isExpanded ? 'rotate-180' : '',
                  ].join(' ')}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Pool body */}
            {isExpanded && (
              <div className="bg-white border-t border-[#E5E7EB] p-4 space-y-4">
                {/* Rolls min / max */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">
                      {t('lootTable.rollsMin')}
                    </label>
                    <input
                      type="number"
                      value={pool.rollsMin}
                      onChange={(e) =>
                        handlePoolRollsChange(
                          pool.id,
                          'rollsMin',
                          Number(e.target.value),
                        )
                      }
                      min={1}
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">
                      {t('lootTable.rollsMax')}
                    </label>
                    <input
                      type="number"
                      value={pool.rollsMax}
                      onChange={(e) =>
                        handlePoolRollsChange(
                          pool.id,
                          'rollsMax',
                          Number(e.target.value),
                        )
                      }
                      min={1}
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
                    />
                  </div>
                </div>

                {/* Entries */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {t('lootTable.entries')}
                  </div>
                  <div className="space-y-1.5">
                    {pool.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        <select
                          value={entry.type}
                          onChange={(e) =>
                            handleEntryUpdate(pool.id, entry.id, {
                              type: e.target.value as 'item' | 'loot_table',
                            })
                          }
                          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5D9C3B] bg-white"
                          aria-label={t('lootTable.entryType')}
                        >
                          <option value="item">{t('lootTable.typeItem')}</option>
                          <option value="loot_table">
                            {t('lootTable.typeLootTable')}
                          </option>
                        </select>
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) =>
                            handleEntryUpdate(pool.id, entry.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder={t('lootTable.entryName')}
                          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono flex-1 min-w-[120px] focus:outline-none focus:border-[#5D9C3B]"
                        />
                        <input
                          type="number"
                          value={entry.weight}
                          onChange={(e) =>
                            handleEntryUpdate(pool.id, entry.id, {
                              weight: Number(e.target.value),
                            })
                          }
                          min={1}
                          title={t('lootTable.entryWeight')}
                          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
                        />
                        <input
                          type="number"
                          value={entry.count}
                          onChange={(e) =>
                            handleEntryUpdate(pool.id, entry.id, {
                              count: Number(e.target.value),
                            })
                          }
                          min={1}
                          title={t('lootTable.entryCount')}
                          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(pool.id, entry.id)}
                          aria-label="Delete entry"
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 bg-transparent cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddEntry(pool.id)}
                    className="mt-2 text-sm text-[#5D9C3B] hover:text-[#4f8832] border border-dashed border-[#5D9C3B] rounded px-3 py-1 bg-transparent cursor-pointer"
                  >
                    {t('lootTable.addEntry')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Pool */}
      <button
        type="button"
        onClick={handleAddPool}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-[#5D9C3B] hover:text-[#5D9C3B] cursor-pointer bg-transparent transition-colors"
      >
        {t('lootTable.addPool')}
      </button>
    </div>
  )
}
