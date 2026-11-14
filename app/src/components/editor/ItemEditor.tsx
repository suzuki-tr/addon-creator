import type { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { JsonPreviewPanel } from '@/components/editor/JsonPreviewPanel'
import { ResizeHandle } from '@/components/editor/ResizeHandle'

type ItemTab = 'basic' | 'components'

// ---------------------------------------------------------------------------
// Basic tab (controlled)
// ---------------------------------------------------------------------------

interface ItemBasicTabProps {
  name: string
  itemId: string
  stackSize: number
  rarity: string
  onNameChange: (v: string) => void
  onItemIdChange: (v: string) => void
  onStackSizeChange: (v: number) => void
  onRarityChange: (v: string) => void
}

const ItemBasicTab = ({
  name,
  itemId,
  stackSize,
  rarity,
  onNameChange,
  onItemIdChange,
  onStackSizeChange,
  onRarityChange,
}: ItemBasicTabProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.item.basic.name')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          placeholder="My Item"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.item.basic.id')}
        </label>
        <input
          type="text"
          value={itemId}
          onChange={(e) => onItemIdChange(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          placeholder="myaddon:my_item"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.item.basic.stackSize')}
        </label>
        <input
          type="number"
          min={1}
          max={64}
          value={stackSize}
          onChange={(e) => onStackSizeChange(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.item.basic.rarity')}
        </label>
        <select
          value={rarity}
          onChange={(e) => onRarityChange(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-48"
        >
          <option value="common">common</option>
          <option value="uncommon">uncommon</option>
          <option value="rare">rare</option>
          <option value="epic">epic</option>
        </select>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Components tab (controlled)
// ---------------------------------------------------------------------------

interface ItemComponentsTabProps {
  foodEnabled: boolean
  nutrition: number
  saturation: number
  durability: number
  maxStackSize: number
  attackDamage: number
  onFoodEnabledChange: (v: boolean) => void
  onNutritionChange: (v: number) => void
  onSaturationChange: (v: number) => void
  onDurabilityChange: (v: number) => void
  onMaxStackSizeChange: (v: number) => void
  onAttackDamageChange: (v: number) => void
}

const ItemComponentsTab = ({
  foodEnabled,
  nutrition,
  saturation,
  durability,
  maxStackSize,
  attackDamage,
  onFoodEnabledChange,
  onNutritionChange,
  onSaturationChange,
  onDurabilityChange,
  onMaxStackSizeChange,
  onAttackDamageChange,
}: ItemComponentsTabProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 max-w-xl">
      {/* minecraft:food */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.item.comp.food')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={foodEnabled}
              onChange={(e) => onFoodEnabledChange(e.target.checked)}
              className="cursor-pointer"
            />
            {t('editor.item.comp.food')}
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nutrition</label>
            <input
              type="number"
              min={0}
              value={nutrition}
              onChange={(e) => onNutritionChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Saturation</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={saturation}
              onChange={(e) => onSaturationChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:durability */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.item.comp.durability')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Durability</label>
            <input
              type="number"
              min={1}
              value={durability}
              onChange={(e) => onDurabilityChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:max_stack_size */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.item.comp.maxStack')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Max Stack Size</label>
            <input
              type="number"
              min={1}
              max={64}
              value={maxStackSize}
              onChange={(e) => onMaxStackSizeChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:weapon */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.item.comp.weapon')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Attack Damage</label>
            <input
              type="number"
              min={0}
              value={attackDamage}
              onChange={(e) => onAttackDamageChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ItemEditor page
// ---------------------------------------------------------------------------

export const ItemEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const [activeTab, setActiveTab] = useState<ItemTab>('basic')
  const [jsonPanelWidth, setJsonPanelWidth] = useState<number>(() => {
    const s = localStorage.getItem('json-panel-width')
    return s !== null ? (parseInt(s, 10) || 360) : 360
  })

  // Controlled state for Basic tab
  const [name, setName] = useState('My Item')
  const [itemId, setItemId] = useState('my_item')
  const [stackSize, setStackSize] = useState(64)
  const [rarity, setRarity] = useState('common')

  // Controlled state for Components tab
  const [foodEnabled, setFoodEnabled] = useState(false)
  const [nutrition, setNutrition] = useState(4)
  const [saturation, setSaturation] = useState(0.6)
  const [durability, setDurability] = useState(64)
  const [maxStackSize, setMaxStackSize] = useState(64)
  const [attackDamage, setAttackDamage] = useState(1)

  useEffect(() => {
    localStorage.setItem('json-panel-width', String(jsonPanelWidth))
  }, [jsonPanelWidth])

  const TABS: { id: ItemTab; label: string }[] = [
    { id: 'basic', label: t('editor.item.tabs.basic') },
    { id: 'components', label: t('editor.item.tabs.components') },
  ]

  /** JSON reflecting live form state */
  const itemJson = useMemo((): string => {
    const components: Record<string, unknown> = {
      'minecraft:max_stack_size': stackSize,
    }
    if (foodEnabled) {
      components['minecraft:food'] = {
        nutrition,
        saturation_modifier: saturation,
      }
    }
    const obj = {
      format_version: '1.20.0',
      'minecraft:item': {
        description: { identifier: `myaddon:${itemId}` },
        components,
      },
    }
    return JSON.stringify(obj, null, 2)
  }, [itemId, stackSize, foodEnabled, nutrition, saturation])

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = jsonPanelWidth
    const onMove = (me: MouseEvent): void => {
      const delta = startX - me.clientX
      setJsonPanelWidth(
        Math.max(200, Math.min(Math.floor(window.innerWidth * 0.5), startWidth + delta)),
      )
    }
    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Main editor area */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Tab bar */}
        <div
          className="bg-white border-b border-[#E5E7EB] flex px-6 gap-0.5 flex-shrink-0"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={'item-tab-' + tab.id}
              aria-controls={'item-tabpanel-' + tab.id}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-5 py-3 text-sm font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'text-[#5D9C3B] border-b-2 border-[#5D9C3B] font-semibold'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          role="tabpanel"
          id={'item-tabpanel-' + activeTab}
          aria-labelledby={'item-tab-' + activeTab}
        >
          {activeTab === 'basic' && (
            <ItemBasicTab
              name={name}
              itemId={itemId}
              stackSize={stackSize}
              rarity={rarity}
              onNameChange={setName}
              onItemIdChange={setItemId}
              onStackSizeChange={setStackSize}
              onRarityChange={setRarity}
            />
          )}
          {activeTab === 'components' && (
            <ItemComponentsTab
              foodEnabled={foodEnabled}
              nutrition={nutrition}
              saturation={saturation}
              durability={durability}
              maxStackSize={maxStackSize}
              attackDamage={attackDamage}
              onFoodEnabledChange={setFoodEnabled}
              onNutritionChange={setNutrition}
              onSaturationChange={setSaturation}
              onDurabilityChange={setDurability}
              onMaxStackSizeChange={setMaxStackSize}
              onAttackDamageChange={setAttackDamage}
            />
          )}
        </div>
      </main>

      {/* Right panel: JSON preview (advanced mode only) */}
      {mode === 'advanced' && (
        <aside
          className="bg-white border-l border-[#E5E7EB] flex flex-row overflow-hidden flex-shrink-0"
          style={{ width: jsonPanelWidth }}
        >
          <ResizeHandle onMouseDown={handleResizeMouseDown} />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <JsonPreviewPanel
              entityName={t('editor.files.placeholderEntityName')}
              jsonOverride={itemJson}
            />
          </div>
        </aside>
      )}
    </div>
  )
}
