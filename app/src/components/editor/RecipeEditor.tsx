import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type RecipeType = 'shaped' | 'shapeless' | 'furnace'

type RecipeTabLabelKey =
  | 'recipe.tabs.shaped'
  | 'recipe.tabs.shapeless'
  | 'recipe.tabs.furnace'

interface RecipeTabDef {
  id: RecipeType
  labelKey: RecipeTabLabelKey
}

const RECIPE_TABS: RecipeTabDef[] = [
  { id: 'shaped', labelKey: 'recipe.tabs.shaped' },
  { id: 'shapeless', labelKey: 'recipe.tabs.shapeless' },
  { id: 'furnace', labelKey: 'recipe.tabs.furnace' },
]

// ---------------------------------------------------------------------------
// Key entry for shaped recipe
// ---------------------------------------------------------------------------

interface KeyEntry {
  id: string
  letter: string
  itemId: string
}

const nextId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// ---------------------------------------------------------------------------
// ShapedRecipePanel
// ---------------------------------------------------------------------------

const ShapedRecipePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length: 9 }, () => ''),
  )
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [keys, setKeys] = useState<KeyEntry[]>([])
  const [resultItem, setResultItem] = useState('')
  const [resultCount, setResultCount] = useState(1)

  const handleSlotClick = (idx: number): void => {
    setSelectedSlot((prev) => (prev === idx ? null : idx))
  }

  const handleSlotChange = (value: string): void => {
    if (selectedSlot === null) return
    const idx = selectedSlot
    setSlots((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleAddKey = (): void => {
    setKeys((prev) => [
      ...prev,
      { id: nextId(), letter: '', itemId: '' },
    ])
  }

  const handleDeleteKey = (id: string): void => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const handleKeyChange = (
    id: string,
    field: 'letter' | 'itemId',
    value: string,
  ): void => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, [field]: value } : k)),
    )
  }

  return (
    <div className="space-y-6">
      {/* 3×3 grid */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">
          {t('recipe.pattern')}
        </div>
        <div className="grid grid-cols-3 gap-1 w-fit">
          {slots.map((slot, idx) => (
            <button
              // idx is stable (position 0–8)
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              type="button"
              title={`${t('recipe.slot')} ${idx + 1}`}
              onClick={() => handleSlotClick(idx)}
              className={[
                'w-12 h-12 border rounded text-[9px] font-mono overflow-hidden px-0.5 leading-tight',
                selectedSlot === idx
                  ? 'border-[#5D9C3B] bg-[#F0F8EA] text-[#5D9C3B]'
                  : 'border-[#E5E7EB] bg-white text-gray-700 hover:border-gray-400',
              ].join(' ')}
            >
              <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
                {slot || t('recipe.empty')}
              </span>
            </button>
          ))}
        </div>
        {selectedSlot !== null && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {t('recipe.slot')} {selectedSlot + 1}:
            </span>
            <input
              type="text"
              value={slots[selectedSlot] ?? ''}
              onChange={(e) => handleSlotChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSelectedSlot(null)
              }}
              onBlur={() => setSelectedSlot(null)}
              placeholder={t('recipe.itemId')}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-48 focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
        )}
      </div>

      {/* Keys section */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">
          {t('recipe.keys')}
        </div>
        <div className="space-y-1.5">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center gap-2">
              <input
                type="text"
                value={key.letter}
                onChange={(e) =>
                  handleKeyChange(key.id, 'letter', e.target.value)
                }
                maxLength={1}
                placeholder="A"
                className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-10 text-center focus:outline-none focus:border-[#5D9C3B]"
              />
              <input
                type="text"
                value={key.itemId}
                onChange={(e) =>
                  handleKeyChange(key.id, 'itemId', e.target.value)
                }
                placeholder={t('recipe.itemId')}
                className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-[#5D9C3B]"
              />
              <button
                type="button"
                onClick={() => handleDeleteKey(key.id)}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 bg-transparent cursor-pointer"
              >
                {t('recipe.deleteKey')}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddKey}
          className="mt-2 text-sm text-[#5D9C3B] hover:text-[#4f8832] border border-dashed border-[#5D9C3B] rounded px-3 py-1 bg-transparent cursor-pointer"
        >
          {t('recipe.addKey')}
        </button>
      </div>

      {/* Result */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">
          {t('recipe.result')}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={resultItem}
            onChange={(e) => setResultItem(e.target.value)}
            placeholder={t('recipe.itemId')}
            className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-48 focus:outline-none focus:border-[#5D9C3B]"
          />
          <label className="text-xs text-gray-600">
            {t('recipe.resultCount')}
          </label>
          <input
            type="number"
            value={resultCount}
            onChange={(e) => setResultCount(Number(e.target.value))}
            min={1}
            max={64}
            className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ShapelessRecipePanel
// ---------------------------------------------------------------------------

const ShapelessRecipePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [resultItem, setResultItem] = useState('')
  const [resultCount, setResultCount] = useState(1)

  const handleIngredientChange = (idx: number, value: string): void => {
    setIngredients((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleDeleteIngredient = (idx: number): void => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAddIngredient = (): void => {
    if (ingredients.length >= 9) return
    setIngredients((prev) => [...prev, ''])
  }

  return (
    <div className="space-y-6">
      {/* Ingredients */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">
          {t('recipe.ingredients')}
        </div>
        <div className="space-y-1.5">
          {ingredients.map((ing, idx) => (
            <div
              // idx is stable position
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={ing}
                onChange={(e) => handleIngredientChange(idx, e.target.value)}
                placeholder={t('recipe.itemId')}
                className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-[#5D9C3B]"
              />
              <button
                type="button"
                onClick={() => handleDeleteIngredient(idx)}
                aria-label="Delete ingredient"
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddIngredient}
          disabled={ingredients.length >= 9}
          className="mt-2 text-sm text-[#5D9C3B] hover:text-[#4f8832] border border-dashed border-[#5D9C3B] rounded px-3 py-1 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('recipe.addIngredient')}
        </button>
      </div>

      {/* Result */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">
          {t('recipe.result')}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={resultItem}
            onChange={(e) => setResultItem(e.target.value)}
            placeholder={t('recipe.itemId')}
            className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-48 focus:outline-none focus:border-[#5D9C3B]"
          />
          <label className="text-xs text-gray-600">
            {t('recipe.resultCount')}
          </label>
          <input
            type="number"
            value={resultCount}
            onChange={(e) => setResultCount(Number(e.target.value))}
            min={1}
            max={64}
            className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-16 focus:outline-none focus:border-[#5D9C3B]"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FurnaceRecipePanel
// ---------------------------------------------------------------------------

const FurnaceRecipePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [cookTime, setCookTime] = useState(200)
  const [experience, setExperience] = useState(0.1)

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">
          {t('recipe.input')}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('recipe.itemId')}
          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">
          {t('recipe.output')}
        </label>
        <input
          type="text"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder={t('recipe.itemId')}
          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">
          {t('recipe.cookTime')}
        </label>
        <input
          type="number"
          value={cookTime}
          onChange={(e) => setCookTime(Number(e.target.value))}
          min={0}
          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-28 focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">
          {t('recipe.experience')}
        </label>
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(Number(e.target.value))}
          min={0}
          step={0.1}
          className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-mono w-28 focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RecipeEditor (exported)
// ---------------------------------------------------------------------------

export const RecipeEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const [recipeType, setRecipeType] = useState<RecipeType>('shaped')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div
        className="bg-white border-b border-[#E5E7EB] flex px-6 gap-0.5 flex-shrink-0"
        role="tablist"
      >
        {RECIPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-recipe-${tab.id}`}
            aria-controls={`tabpanel-recipe-${tab.id}`}
            aria-selected={recipeType === tab.id}
            onClick={() => setRecipeType(tab.id)}
            className={[
              'px-5 py-3 text-sm font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors',
              recipeType === tab.id
                ? 'text-[#5D9C3B] border-b-2 border-[#5D9C3B] font-semibold'
                : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700',
            ].join(' ')}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="flex-1 overflow-y-auto p-6"
        role="tabpanel"
        id={`tabpanel-recipe-${recipeType}`}
        aria-labelledby={`tab-recipe-${recipeType}`}
      >
        {recipeType === 'shaped' && <ShapedRecipePanel />}
        {recipeType === 'shapeless' && <ShapelessRecipePanel />}
        {recipeType === 'furnace' && <FurnaceRecipePanel />}
      </div>
    </div>
  )
}
