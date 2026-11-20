import type { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { useProjectStore, DEFAULT_STATUS } from '@/stores/projectStore'
import { downloadMcaddon } from '@/lib/mcaddonGenerator'
import { saveProjectToDirectory } from '@/lib/projectFile'
import { JsonPreviewPanel } from '@/components/editor/JsonPreviewPanel'
import { ResizeHandle } from '@/components/editor/ResizeHandle'

type BlockTab = 'basic' | 'components'

// ---------------------------------------------------------------------------
// Basic tab (controlled)
// ---------------------------------------------------------------------------

interface BlockBasicTabProps {
  name: string
  blockId: string
  material: string
  onNameChange: (v: string) => void
  onBlockIdChange: (v: string) => void
  onMaterialChange: (v: string) => void
}

const BlockBasicTab = ({
  name,
  blockId,
  material,
  onNameChange,
  onBlockIdChange,
  onMaterialChange,
}: BlockBasicTabProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.block.basic.name')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
          value={blockId}
          onChange={(e) => onBlockIdChange(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          placeholder="myaddon:my_block"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.block.basic.material')}
        </label>
        <select
          value={material}
          onChange={(e) => onMaterialChange(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-48"
        >
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
// Components tab (controlled)
// ---------------------------------------------------------------------------

interface BlockComponentsTabProps {
  hardness: number
  burnOdds: number
  flameOdds: number
  friction: number
  lightLevel: number
  destructible: boolean
  secondsToDestroy: number
  onHardnessChange: (v: number) => void
  onBurnOddsChange: (v: number) => void
  onFlameOddsChange: (v: number) => void
  onFrictionChange: (v: number) => void
  onLightLevelChange: (v: number) => void
  onDestructibleChange: (v: boolean) => void
  onSecondsToDestroyChange: (v: number) => void
}

const BlockComponentsTab = ({
  hardness,
  burnOdds,
  flameOdds,
  friction,
  lightLevel,
  destructible,
  secondsToDestroy,
  onHardnessChange,
  onBurnOddsChange,
  onFlameOddsChange,
  onFrictionChange,
  onLightLevelChange,
  onDestructibleChange,
  onSecondsToDestroyChange,
}: BlockComponentsTabProps): JSX.Element => {
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
              value={hardness}
              onChange={(e) => onHardnessChange(Number(e.target.value))}
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
              value={burnOdds}
              onChange={(e) => onBurnOddsChange(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B] w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Flame Odds</label>
            <input
              type="number"
              min={0}
              value={flameOdds}
              onChange={(e) => onFlameOddsChange(Number(e.target.value))}
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
              value={friction}
              onChange={(e) => onFrictionChange(Number(e.target.value))}
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
              value={lightLevel}
              onChange={(e) => onLightLevelChange(Number(e.target.value))}
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
            <input
              type="checkbox"
              checked={destructible}
              onChange={(e) => onDestructibleChange(e.target.checked)}
              className="cursor-pointer"
            />
            Enabled
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Seconds to Destroy</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={secondsToDestroy}
              onChange={(e) => onSecondsToDestroyChange(Number(e.target.value))}
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
  const { project, setProject } = useProjectStore()
  const [activeTab, setActiveTab] = useState<BlockTab>('basic')
  const [jsonPanelWidth, setJsonPanelWidth] = useState<number>(() => {
    const s = localStorage.getItem('json-panel-width')
    return s !== null ? (parseInt(s, 10) || 360) : 360
  })

  // Controlled state for Basic tab
  const [name, setName] = useState('My Block')
  const [blockId, setBlockId] = useState('my_block')
  const [material, setMaterial] = useState('stone')

  // Controlled state for Components tab
  const [hardness, setHardness] = useState(1.5)
  const [burnOdds, setBurnOdds] = useState(5)
  const [flameOdds, setFlameOdds] = useState(5)
  const [friction, setFriction] = useState(0.4)
  const [lightLevel, setLightLevel] = useState(0)
  const [destructible, setDestructible] = useState(true)
  const [secondsToDestroy, setSecondsToDestroy] = useState(3.0)

  useEffect(() => {
    localStorage.setItem('json-panel-width', String(jsonPanelWidth))
  }, [jsonPanelWidth])

  const handleSave = (): void => {
    const manifestUuid = project?.manifestUuid ?? crypto.randomUUID()
    const moduleUuid = project?.moduleUuid ?? crypto.randomUUID()
    const rpManifestUuid = project?.rpManifestUuid ?? crypto.randomUUID()
    const rpModuleUuid = project?.rpModuleUuid ?? crypto.randomUUID()
    const exportData = {
      entityId: project?.entityId ?? 'custom_block',
      entityDisplayName: project?.entityDisplayName ?? 'Custom Block',
      contentType: 'block' as const,
      baseType: project?.baseType ?? 'scratch',
      selectedVanillaId: project?.selectedVanillaId ?? null,
      selectedTraits: project?.selectedTraits ?? [],
      status: project?.status ?? DEFAULT_STATUS,
      manifestUuid,
      moduleUuid,
      rpManifestUuid,
      rpModuleUuid,
    }
    if (!project?.manifestUuid) setProject(exportData)
    saveProjectToDirectory(exportData).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      window.alert(`${t('error.storage.saveFailed')}: ${message}`)
    })
  }

  const handleExport = (): void => {
    const exportData = {
      entityId: project?.entityId ?? 'custom_block',
      entityDisplayName: project?.entityDisplayName ?? 'Custom Block',
      contentType: 'block' as const,
      baseType: project?.baseType ?? 'scratch',
      selectedVanillaId: project?.selectedVanillaId ?? null,
      selectedTraits: project?.selectedTraits ?? [],
      status: project?.status ?? DEFAULT_STATUS,
    }
    void downloadMcaddon(exportData)
  }

  const TABS: { id: BlockTab; label: string }[] = [
    { id: 'basic', label: t('editor.block.tabs.basic') },
    { id: 'components', label: t('editor.block.tabs.components') },
  ]

  /** JSON reflecting live form state — all components included so every field change is visible */
  const blockJson = useMemo((): string => {
    const components: Record<string, unknown> = {
      // Always include hardness; explosion_resistance mirrors hardness as a sensible default
      'minecraft:hardness': {
        hardness,
        explosion_resistance: hardness,
      },
      'minecraft:friction': { value: friction },
      'minecraft:light_emission': { emission: lightLevel },
    }

    // Only add flammable when at least one odds value is non-zero
    if (burnOdds > 0 || flameOdds > 0) {
      components['minecraft:flammable'] = {
        burn_odds: burnOdds,
        flame_odds: flameOdds,
      }
    }

    if (destructible) {
      components['minecraft:destructible_by_mining'] = {
        seconds_to_destroy: secondsToDestroy,
      }
    }

    const obj = {
      format_version: '1.20.0',
      'minecraft:block': {
        description: { identifier: `myaddon:${blockId}` },
        components,
      },
    }
    return JSON.stringify(obj, null, 2)
  }, [blockId, hardness, burnOdds, flameOdds, friction, lightLevel, destructible, secondsToDestroy])

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
          {activeTab === 'basic' && (
            <BlockBasicTab
              name={name}
              blockId={blockId}
              material={material}
              onNameChange={setName}
              onBlockIdChange={setBlockId}
              onMaterialChange={setMaterial}
            />
          )}
          {activeTab === 'components' && (
            <BlockComponentsTab
              hardness={hardness}
              burnOdds={burnOdds}
              flameOdds={flameOdds}
              friction={friction}
              lightLevel={lightLevel}
              destructible={destructible}
              secondsToDestroy={secondsToDestroy}
              onHardnessChange={setHardness}
              onBurnOddsChange={setBurnOdds}
              onFlameOddsChange={setFlameOdds}
              onFrictionChange={setFriction}
              onLightLevelChange={setLightLevel}
              onDestructibleChange={setDestructible}
              onSecondsToDestroyChange={setSecondsToDestroy}
            />
          )}
        </div>

        {/* Action bar */}
        <div className="bg-white border-t border-[#E5E7EB] px-6 py-3 flex justify-end items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="border border-[#D1D5DB] rounded-md px-5 py-2 text-sm text-gray-700 bg-white cursor-pointer hover:bg-gray-50"
          >
            💾 {t('common.button.save')}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="bg-[#5D9C3B] rounded-md px-5 py-2 text-sm font-semibold text-white border-none cursor-pointer hover:bg-[#4f8832]"
          >
            ⬇️ {t('common.button.export')}
          </button>
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
              jsonOverride={blockJson}
            />
          </div>
        </aside>
      )}
    </div>
  )
}
