import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { SoundEditor } from '@/components/editor/SoundEditor'

// ---------------------------------------------------------------------------
// FileTreeItem (local helper — mirrors EditorPage pattern)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// SoundEditorPage
// ---------------------------------------------------------------------------

export const SoundEditorPage = (): JSX.Element => {
  const { t } = useTranslation()

  const handleSave = (): void => {
    // Phase: persist via projectStore
  }

  const handleExport = (): void => {
    // Phase: generate and download sound_definitions JSON
  }

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left sidebar */}
      <aside className="w-60 min-w-[200px] max-w-xs bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            {t('editor.sidebar.files')}
          </div>
          <FileTreeItem icon="🔊" label="sound_definitions.json" active />
        </div>
      </aside>

      {/* Main editor area */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Title bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">
            {t('sound.pageTitle')}
          </h1>
        </div>

        {/* Scrollable editor content */}
        <div className="flex-1 overflow-y-auto p-6">
          <SoundEditor />
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
