import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { JsonPreviewPanel } from '@/components/editor/JsonPreviewPanel'
import { ResizeHandle } from '@/components/editor/ResizeHandle'

type BlockTab = 'basic' | 'components' | 'json'

// ---------------------------------------------------------------------------
// Basic tab
// ---------------------------------------------------------------------------

const BlockBasicTab = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.block.basic.name')}
        </label>
        <input
          type="text"
          className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          placeholder="My Block"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.block.basic.id')}
        </label>
        <input
          type="text"
          className="border border-gray-200 rounded px-2 py-1.5 text-sm font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          placeholder="myaddon:my_block"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.block.basic.material')}
        </label>
        <select className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-48">
          <option value="stone">stone</option>
          <option value="wood">wood</option>
          <option value="metal">metal</option>
          <option value="dirt">dirt</option>
          <option value="glass">glass</option>
        </select>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Components tab
// ---------------------------------------------------------------------------

const BlockComponentsTab = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 max-w-xl">
      {/* minecraft:hardness */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.block.comp.hardness')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Hardness</label>
            <input
              type="number"
              min={0}
              step={0.1}
              defaultValue={1.5}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:flammable */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.block.comp.flammable')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Burn Odds</label>
            <input
              type="number"
              min={0}
              defaultValue={5}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Flame Odds</label>
            <input
              type="number"
              min={0}
              defaultValue={5}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:friction */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.block.comp.friction')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Friction</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.4}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:light_emission */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.block.comp.lightEmission')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Light Level</label>
            <input
              type="number"
              min={0}
              max={15}
              defaultValue={0}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>

      {/* minecraft:destructible_by_mining */}
      <details className="border border-gray-200 rounded-md overflow-hidden">
        <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 bg-white list-none flex items-center gap-2">
          <span className="text-gray-400">▶</span>
          {t('editor.block.comp.destructible')}
        </summary>
        <div className="px-4 py-3 flex flex-col gap-3 bg-gray-50 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" defaultChecked className="cursor-pointer" />
            Enabled
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Seconds to Destroy</label>
            <input
              type="number"
              min={0}
              step={0.5}
              defaultValue={3.0}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
        </div>
      </details>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BlockEditor page
// ---------------------------------------------------------------------------

export const BlockEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const [activeTab, setActiveTab] = useState<BlockTab>('basic')
  const [jsonPanelWidth, setJsonPanelWidth] = useState<number>(() => {
    const s = localStorage.getItem('json-panel-width')
    return s !== null ? (parseInt(s, 10) || 360) : 360
  })

  useEffect(() => {
    localStorage.setItem('json-panel-width', String(jsonPanelWidth))
  }, [jsonPanelWidth])

  const TABS: { id: BlockTab; label: string }[] = [
    { id: 'basic', label: t('editor.block.tabs.basic') },
    { id: 'components', label: t('editor.block.tabs.components') },
    { id: 'json', label: t('editor.block.tabs.json') },
  ]

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
              id={'block-tab-' + tab.id}
              aria-controls={'block-tabpanel-' + tab.id}
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
          id={'block-tabpanel-' + activeTab}
          aria-labelledby={'block-tab-' + activeTab}
        >
          {activeTab === 'basic' && <BlockBasicTab />}
          {activeTab === 'components' && <BlockComponentsTab />}
          {activeTab === 'json' && (
            <div className="h-full -m-6 overflow-hidden">
              <JsonPreviewPanel entityName={t('editor.files.placeholderEntityName')} />
            </div>
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
          <div className="flex-1 min-w-0 overflow-hidden">
            <JsonPreviewPanel entityName={t('editor.files.placeholderEntityName')} />
          </div>
        </aside>
      )}
    </div>
  )
}
