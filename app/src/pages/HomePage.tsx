import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Badge variant for content type coloring */
type ContentBadge = 'mob' | 'block' | 'item'

interface RecentProject {
  id: string
  name: string
  type: ContentBadge
  typeLabel: string
  daysAgo: string
  icon: string
}

const BADGE_CLASSES: Record<ContentBadge, string> = {
  mob: 'bg-emerald-100 text-emerald-800',
  block: 'bg-blue-100 text-blue-800',
  item: 'bg-red-100 text-red-800',
}

const PLACEHOLDER_PROJECTS: RecentProject[] = [
  {
    id: 'mob-1',
    name: 'かっこいいモブ',
    type: 'mob',
    typeLabel: 'モブ',
    daysAgo: '2日前',
    icon: '🐾',
  },
  {
    id: 'block-1',
    name: '光るブロック',
    type: 'block',
    typeLabel: 'ブロック',
    daysAgo: '5日前',
    icon: '🧱',
  },
  {
    id: 'item-1',
    name: 'まほうの剣',
    type: 'item',
    typeLabel: 'アイテム',
    daysAgo: '1週間前',
    icon: '⚔️',
  },
]

export const HomePage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleNewAddon = (): void => {
    void navigate('/wizard')
  }

  const handleOpenProject = (): void => {
    // Phase 3: open file picker / project browser
  }

  const handleEditProject = (): void => {
    void navigate('/editor')
  }

  return (
    <>
      {/* Hero section */}
      <section className="text-center py-12 px-8 bg-white border border-[#E5E7EB] rounded-xl mb-9">
        <h1 className="text-3xl font-bold text-gray-900 mb-2.5">
          {t('app.name')}
        </h1>
        <p className="text-base text-gray-500 mb-9 leading-relaxed max-w-lg mx-auto">
          {t('home.hero.subtitle')}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            type="button"
            onClick={handleNewAddon}
            className="bg-[#5D9C3B] text-white border-none px-9 py-3.5 font-semibold text-base rounded-lg cursor-pointer min-w-[260px] hover:bg-[#4f8832] transition-colors"
          >
            {t('home.newAddon')}
          </button>
          <button
            type="button"
            onClick={handleOpenProject}
            className="bg-white text-gray-700 border border-[#D1D5DB] px-9 py-3.5 font-medium text-base rounded-lg cursor-pointer min-w-[260px] hover:bg-gray-50 transition-colors"
          >
            {t('home.openProject')}
          </button>
        </div>
      </section>

      {/* Recent projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('home.recentProjects')}
        </h2>
        <button
          type="button"
          className="text-sm text-[#5D9C3B] cursor-pointer underline bg-transparent border-none"
        >
          {t('home.viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLACEHOLDER_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-[#E5E7EB] rounded-xl p-4"
          >
            {/* Thumbnail placeholder */}
            <div className="w-full h-22 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 mb-3 h-[88px]">
              <span className="text-3xl">{project.icon}</span>
            </div>

            <div className="font-semibold text-sm mb-2 text-gray-900">
              {project.name}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_CLASSES[project.type]}`}
              >
                {project.typeLabel}
              </span>
              <span className="text-xs text-gray-400">{project.daysAgo}</span>
            </div>

            <button
              type="button"
              onClick={handleEditProject}
              className="block w-full py-2 bg-gray-100 border border-[#E5E7EB] rounded text-xs cursor-pointer text-center text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t('home.project.edit')}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
