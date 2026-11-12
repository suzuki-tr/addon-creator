import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TraitCard } from '@/components/editor/TraitCard'
import type { TraitCardData } from '@/components/editor/TraitCard'

type EditorTab = 'traits' | 'status' | 'appearance'

/** Tabs shown in both simple and advanced mode */
const TABS: { id: EditorTab; labelKey: 'editor.tabs.traits' | 'editor.tabs.status' | 'editor.tabs.appearance' }[] = [
  { id: 'traits', labelKey: 'editor.tabs.traits' },
  { id: 'status', labelKey: 'editor.tabs.status' },
  { id: 'appearance', labelKey: 'editor.tabs.appearance' },
]

export const EditorPage = (): JSX.Element => {
  const { t } = useTranslation()
  /** Placeholder entity name shown in the sidebar — localised via i18n */
  const entityName = t('editor.files.placeholderEntityName')
  const [activeTab, setActiveTab] = useState<EditorTab>('traits')
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(
    new Set(['hostile']),
  )

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

  const handleToggleTrait = (id: string): void => {
    setSelectedTraits((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = (): void => {
    // Phase 3: persist via projectStore
    alert(t('export.success', { name: entityName }))
  }

  const handleExport = (): void => {
    // Phase 2 export: JSZip generation
    alert(t('export.generating'))
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
          aria-label={t(TABS.find((t) => t.id === activeTab)?.labelKey ?? 'editor.tabs.traits')}
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
            <div className="text-gray-500 text-sm">
              {/* Phase 3: status panel */}
              <p>{t('common.label.loading')}</p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="text-gray-500 text-sm">
              {/* Phase 3: appearance panel */}
              <p>{t('common.label.loading')}</p>
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
