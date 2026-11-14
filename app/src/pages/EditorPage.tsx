import type { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { useProjectStore, DEFAULT_STATUS } from '@/stores/projectStore'
import type { ProjectData } from '@/stores/projectStore'
import { downloadMcaddon } from '@/lib/mcaddonGenerator'
import { saveProjectToDirectory } from '@/lib/projectFile'
import { TraitCard } from '@/components/editor/TraitCard'
import type { TraitCardData } from '@/components/editor/TraitCard'
import { JsonPreviewPanel } from '@/components/editor/JsonPreviewPanel'
import { ComponentPanel } from '@/components/editor/ComponentPanel'
import { StateGraph } from '@/components/editor/StateGraph'
import { AppearancePanel } from '@/components/editor/AppearancePanel'
import { StatusPanel } from '@/components/editor/StatusPanel'
import { ResizeHandle } from '@/components/editor/ResizeHandle'

type EditorTab = 'traits' | 'status' | 'appearance' | 'components' | 'stateGraph'

type EditorTabLabelKey =
  | 'editor.tabs.traits'
  | 'editor.tabs.status'
  | 'editor.tabs.appearance'
  | 'editor.tabs.components'
  | 'editor.tabs.stateGraph'

interface TabDef {
  id: EditorTab
  labelKey: EditorTabLabelKey
}

export const EditorPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const { project, updateTraits } = useProjectStore()
  /** Entity name shown in the sidebar — from loaded project, falls back to i18n placeholder */
  const entityName =
    project?.entityDisplayName ?? t('editor.files.placeholderEntityName')
  const [activeTab, setActiveTab] = useState<EditorTab>('traits')
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(
    new Set(project?.selectedTraits ?? []),
  )
  const [jsonPanelWidth, setJsonPanelWidth] = useState<number>(() => {
    const s = localStorage.getItem('json-panel-width')
    return s !== null ? parseInt(s, 10) : 360
  })

  /**
   * Reset activeTab when the current tab is not available in the new mode:
   * - switching to simple mode while on a advanced-only tab (components, stateGraph)
   * - switching to advanced mode while on status tab (simple-only)
   */
  useEffect(() => {
    if (mode === 'advanced' && activeTab === 'status') {
      setActiveTab('traits')
    } else if (
      mode === 'simple' &&
      (activeTab === 'components' || activeTab === 'stateGraph')
    ) {
      setActiveTab('traits')
    }
  }, [mode, activeTab])

  useEffect(() => {
    localStorage.setItem('json-panel-width', String(jsonPanelWidth))
  }, [jsonPanelWidth])

  const TABS: TabDef[] = useMemo(() => {
    const simpleTabs: TabDef[] = [
      { id: 'traits', labelKey: 'editor.tabs.traits' },
      { id: 'status', labelKey: 'editor.tabs.status' },
      { id: 'appearance', labelKey: 'editor.tabs.appearance' },
    ]
    const advancedTabs: TabDef[] = [
      { id: 'traits', labelKey: 'editor.tabs.traits' },
      { id: 'components', labelKey: 'editor.tabs.components' },
      { id: 'stateGraph', labelKey: 'editor.tabs.stateGraph' },
      { id: 'appearance', labelKey: 'editor.tabs.appearance' },
    ]
    return mode === 'advanced' ? advancedTabs : simpleTabs
  }, [mode])

  const traits: TraitCardData[] = [
    {
      id: 'hostile',
      icon: '🗡️',
      name: t('entity.trait.hostile'),
      description: t('entity.trait.hostileDesc'),
    },
    {
      id: 'flying',
      icon: '🦅',
      name: t('entity.trait.flying'),
      description: t('entity.trait.flyingDesc'),
    },
    {
      id: 'tameable',
      icon: '💙',
      name: t('entity.trait.tameable'),
      description: t('entity.trait.tameableDesc'),
    },
    {
      id: 'rideable',
      icon: '🐎',
      name: t('entity.trait.rideable'),
      description: t('entity.trait.rideableDesc'),
    },
    {
      id: 'undead',
      icon: '💀',
      name: t('entity.trait.undead'),
      description: t('entity.trait.undeadDesc'),
    },
    {
      id: 'aquatic',
      icon: '🌊',
      name: t('entity.trait.aquatic'),
      description: t('entity.trait.aquaticDesc'),
    },
    {
      id: 'boss',
      icon: '👑',
      name: t('entity.trait.boss'),
      description: t('entity.trait.bossDesc'),
    },
    {
      id: 'breedable',
      icon: '🍼',
      name: t('entity.trait.breedable'),
      description: t('entity.trait.breedableDesc'),
    },
    {
      id: 'slime',
      icon: '🟢',
      name: t('entity.trait.slime'),
      description: t('entity.trait.slimeDesc'),
    },
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

  const handleToggleTrait = (id: string): void => {
    const next = new Set(selectedTraits)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedTraits(next)
    updateTraits([...next])
  }

  const handleSave = (): void => {
    const exportData: ProjectData = {
      entityId: project?.entityId ?? 'custom_entity',
      entityDisplayName: project?.entityDisplayName ?? 'Custom Entity',
      contentType: project?.contentType ?? 'mob',
      baseType: project?.baseType ?? 'scratch',
      selectedVanillaId: project?.selectedVanillaId ?? null,
      selectedTraits: [...selectedTraits],
      status: project?.status ?? DEFAULT_STATUS,
      ...(project?.geometry !== undefined && { geometry: project.geometry }),
      ...(project?.texture !== undefined && { texture: project.texture }),
    }
    void saveProjectToDirectory(exportData)
  }

  const handleExport = (): void => {
    const exportData: ProjectData = {
      entityId: project?.entityId ?? 'custom_entity',
      entityDisplayName: project?.entityDisplayName ?? 'Custom Entity',
      contentType: project?.contentType ?? 'mob',
      baseType: project?.baseType ?? 'scratch',
      selectedVanillaId: project?.selectedVanillaId ?? null,
      selectedTraits: [...selectedTraits],
      status: project?.status ?? DEFAULT_STATUS,
      ...(project?.geometry !== undefined && { geometry: project.geometry }),
      ...(project?.texture !== undefined && { texture: project.texture }),
    }
    void downloadMcaddon(exportData)
  }

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left sidebar */}
      <aside className="w-60 min-w-[200px] max-w-xs bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto flex-shrink-0">
        {/* Project section */}
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            {t('editor.sidebar.project')}
          </div>
          <div className="bg-gray-200 rounded p-3 text-xs text-gray-500 text-center">
            {t('editor.sidebar.projectNavPlaceholder')}
          </div>
        </div>

        {/* Files section */}
        <div className="p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            {t('editor.sidebar.files')}
          </div>
          <FileTreeItem icon="🐾" label={`${entityName}.json`} active />
          <FileTreeItem icon="📁" label={t('editor.files.scaleConfig')} />
          <FileTreeItem icon="📄" label={t('editor.files.spawnSettings')} />
          <FileTreeItem icon="📄" label={t('editor.files.lootTable')} />
        </div>
      </aside>

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
              id={'tab-' + tab.id}
              aria-controls={'tabpanel-' + tab.id}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-5 py-3 text-sm font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors',
                activeTab === tab.id
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
          id={'tabpanel-' + activeTab}
          aria-labelledby={'tab-' + activeTab}
        >
          {activeTab === 'traits' && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">
                {t('editor.traits.heading')}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {t('editor.traits.subheading')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {traits.map((trait) => (
                  <TraitCard
                    key={trait.id}
                    trait={trait}
                    checked={selectedTraits.has(trait.id)}
                    onToggle={handleToggleTrait}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === 'status' && (
            project !== null
              ? <StatusPanel initialValues={project.status} />
              : <StatusPanel />
          )}

          {activeTab === 'components' && <ComponentPanel />}

          {activeTab === 'stateGraph' && (
            <div className="h-full -m-6 overflow-hidden">
              <StateGraph />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="h-full -m-6 overflow-hidden">
              <AppearancePanel />
            </div>
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
          <div className="flex-1 min-w-0 overflow-hidden">
            <JsonPreviewPanel entityName={entityName} />
          </div>
        </aside>
      )}
    </div>
  )
}

interface FileTreeItemProps {
  icon: string
  label: string
  active?: boolean
}

const FileTreeItem = ({
  icon,
  label,
  active = false,
}: FileTreeItemProps): JSX.Element => (
  <div
    className={[
      'flex items-center gap-1.5 px-2 py-1.5 rounded text-sm cursor-pointer',
      active
        ? 'bg-[#F0F8EA] text-[#5D9C3B] font-semibold'
        : 'text-gray-700 hover:bg-gray-100',
    ].join(' ')}
  >
    <span className="text-xs">{icon}</span>
    {label}
  </div>
)
