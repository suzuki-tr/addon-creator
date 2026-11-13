import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'

type DifficultyKey = 'easy' | 'normal' | 'hard'

const DIFFICULTIES: DifficultyKey[] = ['easy', 'normal', 'hard']

export const SpawnRulesEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()

  const [entityId, setEntityId] = useState('')
  const [onSurface, setOnSurface] = useState(true)
  const [underground, setUnderground] = useState(false)
  const [inLava, setInLava] = useState(false)
  const [weight, setWeight] = useState(100)
  const [groupMin, setGroupMin] = useState(1)
  const [groupMax, setGroupMax] = useState(3)
  const [biomeTags, setBiomeTags] = useState<string[]>(['plains'])
  const [newBiomeTag, setNewBiomeTag] = useState('')
  const [difficulties, setDifficulties] = useState<Set<DifficultyKey>>(
    () => new Set<DifficultyKey>(['easy', 'normal', 'hard']),
  )
  const [lightMin, setLightMin] = useState(0)
  const [lightMax, setLightMax] = useState(7)

  // Time of Day — advanced mode only
  const [timeDawn, setTimeDawn] = useState(false)
  const [timeDay, setTimeDay] = useState(true)
  const [timeDusk, setTimeDusk] = useState(false)
  const [timeNight, setTimeNight] = useState(false)

  const handleAddBiomeTag = (): void => {
    const tag = newBiomeTag.trim()
    if (tag !== '' && !biomeTags.includes(tag)) {
      setBiomeTags((prev) => [...prev, tag])
      setNewBiomeTag('')
    }
  }

  const handleDeleteBiomeTag = (tag: string): void => {
    setBiomeTags((prev) => prev.filter((bt) => bt !== tag))
  }

  const handleDifficultyToggle = (key: DifficultyKey): void => {
    setDifficulties((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* (1) Entity ID */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('spawnRules.entityId')}
        </label>
        <input
          type="text"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="minecraft:zombie"
          className="border border-[#E5E7EB] rounded px-3 py-1.5 text-sm font-mono w-full focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>

      {/* (2) Population control */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('spawnRules.populationControl')}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onSurface}
              onChange={(e) => setOnSurface(e.target.checked)}
              className="w-4 h-4 accent-[#5D9C3B]"
            />
            <span className="text-sm text-gray-700">
              {t('spawnRules.onSurface')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={underground}
              onChange={(e) => setUnderground(e.target.checked)}
              className="w-4 h-4 accent-[#5D9C3B]"
            />
            <span className="text-sm text-gray-700">
              {t('spawnRules.underground')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inLava}
              onChange={(e) => setInLava(e.target.checked)}
              className="w-4 h-4 accent-[#5D9C3B]"
            />
            <span className="text-sm text-gray-700">
              {t('spawnRules.inLava')}
            </span>
          </label>
        </div>
      </div>

      {/* (3) Conditions */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('spawnRules.conditions')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              {t('spawnRules.weight')}
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min={1}
              className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
          <div />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              {t('spawnRules.groupSizeMin')}
            </label>
            <input
              type="number"
              value={groupMin}
              onChange={(e) => setGroupMin(Number(e.target.value))}
              min={1}
              className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              {t('spawnRules.groupSizeMax')}
            </label>
            <input
              type="number"
              value={groupMax}
              onChange={(e) => setGroupMax(Number(e.target.value))}
              min={1}
              className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
        </div>
      </div>

      {/* (4) Biome filter */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('spawnRules.biomeFilter')}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {biomeTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1.5 bg-[#F0F8EA] border border-[#5D9C3B] text-[#5D9C3B] rounded-full px-3 py-0.5 text-xs font-mono"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleDeleteBiomeTag(tag)}
                aria-label={t('spawnRules.deleteBiomeTag')}
                className="text-[#5D9C3B] hover:text-red-500 bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBiomeTag}
            onChange={(e) => setNewBiomeTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddBiomeTag()
            }}
            placeholder="plains"
            className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-[#5D9C3B]"
          />
          <button
            type="button"
            onClick={handleAddBiomeTag}
            className="text-sm text-[#5D9C3B] hover:text-[#4f8832] border border-[#5D9C3B] rounded px-3 py-1 bg-transparent cursor-pointer"
          >
            {t('spawnRules.addBiomeTag')}
          </button>
        </div>
      </div>

      {/* (5) Difficulty filter */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('spawnRules.difficultyFilter')}
        </div>
        <div className="space-y-2">
          {DIFFICULTIES.map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={difficulties.has(key)}
                onChange={() => handleDifficultyToggle(key)}
                className="w-4 h-4 accent-[#5D9C3B]"
              />
              <span className="text-sm text-gray-700 capitalize">{key}</span>
            </label>
          ))}
        </div>
      </div>

      {/* (6) Light level */}
      <div className="border border-[#E5E7EB] rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('spawnRules.lightLevel')}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              {t('spawnRules.lightMin')}
            </label>
            <input
              type="number"
              value={lightMin}
              onChange={(e) => setLightMin(Number(e.target.value))}
              min={0}
              max={15}
              className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-mono w-20 focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              {t('spawnRules.lightMax')}
            </label>
            <input
              type="number"
              value={lightMax}
              onChange={(e) => setLightMax(Number(e.target.value))}
              min={0}
              max={15}
              className="border border-[#E5E7EB] rounded px-2 py-1 text-sm font-mono w-20 focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
        </div>
      </div>

      {/* (7) Time of Day — advanced mode only */}
      {mode === 'advanced' && (
        <div className="border border-[#E5E7EB] rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            {t('spawnRules.timeOfDay')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timeDawn}
                onChange={(e) => setTimeDawn(e.target.checked)}
                className="w-4 h-4 accent-[#5D9C3B]"
              />
              <span className="text-sm text-gray-700">
                {t('spawnRules.timeDawn')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timeDay}
                onChange={(e) => setTimeDay(e.target.checked)}
                className="w-4 h-4 accent-[#5D9C3B]"
              />
              <span className="text-sm text-gray-700">
                {t('spawnRules.timeDay')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timeDusk}
                onChange={(e) => setTimeDusk(e.target.checked)}
                className="w-4 h-4 accent-[#5D9C3B]"
              />
              <span className="text-sm text-gray-700">
                {t('spawnRules.timeDusk')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timeNight}
                onChange={(e) => setTimeNight(e.target.checked)}
                className="w-4 h-4 accent-[#5D9C3B]"
              />
              <span className="text-sm text-gray-700">
                {t('spawnRules.timeNight')}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
