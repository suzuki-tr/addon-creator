import type { JSX, ChangeEvent } from 'react'
import { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { loadProjectFile } from '@/lib/projectFile'

/** Badge variant for content type coloring */
type ContentBadge = 'mob' | 'block' | 'item'

/** Translation key for a project's relative time string */
type DaysAgoKey =
  | 'home.project.daysAgo2'
  | 'home.project.daysAgo5'
  | 'home.project.weeksAgo1'

interface RecentProject {
  id: string
  name: string
  type: ContentBadge
  daysAgoKey: DaysAgoKey
  icon: string
}

/** Map content type to the existing wizard step1 i18n key */
const TYPE_LABEL_KEYS = {
  mob: 'wizard.step1.mob',
  block: 'wizard.step1.block',
  item: 'wizard.step1.item',
} as const

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
    daysAgoKey: 'home.project.daysAgo2',
    icon: '🐾',
  },
  {
    id: 'block-1',
    name: '光るブロック',
    type: 'block',
    daysAgoKey: 'home.project.daysAgo5',
    icon: '🧱',
  },
  {
    id: 'item-1',
    name: 'まほうの剣',
    type: 'item',
    daysAgoKey: 'home.project.weeksAgo1',
    icon: '⚔️',
  },
]

// ---------------------------------------------------------------------------
// Kids home layout (locale === 'ja-kids')
// Follows wireframe #07: bg-[#FFFBEB], large buttons, vertical project list
// ---------------------------------------------------------------------------

interface KidsHomeLayoutProps {
  onNewAddon: () => void
  onOpenProject: () => void
  onEditProject: () => void
}

const KidsHomeLayout = ({
  onNewAddon,
  onOpenProject,
  onEditProject,
}: KidsHomeLayoutProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="max-w-[900px] mx-auto px-6 py-9">
      {/* Hero section */}
      <section className="text-center py-12 px-8 bg-white border-2 border-[#E5E7EB] rounded-2xl mb-9">
        <h1 className="text-[2.2rem] font-bold text-gray-900 mb-3.5 leading-snug">
          {t('app.name')}
        </h1>
        <p className="text-[1.3rem] text-gray-700 mb-9 leading-relaxed">
          {t('home.hero.subtitle')}
        </p>

        {/* Full-width stacked CTA buttons */}
        <div className="flex flex-col gap-4 max-w-[560px] mx-auto">
          <button
            type="button"
            onClick={onNewAddon}
            className="bg-[#5D9C3B] text-white border-none min-h-[64px] text-[1.3rem] font-bold rounded-2xl w-full cursor-pointer hover:bg-[#4f8832] transition-colors px-8"
          >
            {t('home.newAddon')}
          </button>
          <button
            type="button"
            onClick={onOpenProject}
            className="bg-white text-gray-700 border-[2.5px] border-[#D1D5DB] min-h-[64px] text-[1.3rem] font-semibold rounded-2xl w-full cursor-pointer hover:bg-gray-50 transition-colors px-8"
          >
            {t('home.openProject')}
          </button>
        </div>
      </section>

      {/* Recent projects — vertical list */}
      <h2 className="text-[1.5rem] font-bold text-gray-900 mb-4">
        {t('home.recentProjects')}
      </h2>

      <div className="flex flex-col gap-3.5">
        {PLACEHOLDER_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-5"
          >
            <span className="text-[2.8rem] leading-none flex-shrink-0">
              {project.icon}
            </span>
            <div className="flex-1">
              <div className="text-[1.3rem] font-bold text-gray-900 mb-1">
                {project.name}
              </div>
              <div className="text-base text-gray-500">
                {t(project.daysAgoKey)}
              </div>
            </div>
            <button
              type="button"
              onClick={onEditProject}
              className="bg-[#5D9C3B] text-white border-none min-h-[48px] rounded-xl px-5 font-bold cursor-pointer hover:bg-[#4f8832] transition-colors flex-shrink-0 whitespace-nowrap"
            >
              {t('home.project.edit')}
            </button>
          </div>
        ))}
      </div>

      {/* Editor Tools section */}
      <div className="mt-9">
        <h2 className="text-[1.5rem] font-bold text-gray-900 mb-4">
          {t('home.tools.title')}
        </h2>
        <div className="grid grid-cols-3 gap-3.5">
          <Link
            to="/recipe"
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-[2rem] mb-2">🧪</div>
            <div className="text-base font-bold text-gray-900">
              {t('home.tools.recipe')}
            </div>
          </Link>
          <Link
            to="/loot-table"
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-[2rem] mb-2">🎲</div>
            <div className="text-base font-bold text-gray-900">
              {t('home.tools.lootTable')}
            </div>
          </Link>
          <Link
            to="/spawn-rules"
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-[2rem] mb-2">🌍</div>
            <div className="text-base font-bold text-gray-900">
              {t('home.tools.spawnRules')}
            </div>
          </Link>
          <Link
            to="/animation-controller"
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-[2rem] mb-2">🎬</div>
            <div className="text-base font-bold text-gray-900">
              {t('home.tools.animationController')}
            </div>
          </Link>
          <Link
            to="/sound"
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-[2rem] mb-2">🔊</div>
            <div className="text-base font-bold text-gray-900">
              {t('home.tools.sound')}
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Standard home layout (locale === 'ja' or 'en')
// ---------------------------------------------------------------------------

interface StandardHomeLayoutProps {
  onNewAddon: () => void
  onOpenProject: () => void
  onEditProject: () => void
}

const StandardHomeLayout = ({
  onNewAddon,
  onOpenProject,
  onEditProject,
}: StandardHomeLayoutProps): JSX.Element => {
  const { t } = useTranslation()

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
            onClick={onNewAddon}
            className="bg-[#5D9C3B] text-white border-none px-9 py-3.5 font-semibold text-base rounded-lg cursor-pointer min-w-[260px] hover:bg-[#4f8832] transition-colors"
          >
            {t('home.newAddon')}
          </button>
          <button
            type="button"
            onClick={onOpenProject}
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
          disabled
          aria-disabled="true"
          className="text-sm text-[#5D9C3B] cursor-not-allowed opacity-50 underline bg-transparent border-none"
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
                {t(TYPE_LABEL_KEYS[project.type])}
              </span>
              <span className="text-xs text-gray-400">
                {t(project.daysAgoKey)}
              </span>
            </div>

            <button
              type="button"
              onClick={onEditProject}
              className="block w-full py-2 bg-gray-100 border border-[#E5E7EB] rounded text-xs cursor-pointer text-center text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t('home.project.edit')}
            </button>
          </div>
        ))}
      </div>

      {/* Editor Tools section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('home.tools.title')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/recipe"
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-2xl mb-2">🧪</div>
            <div className="text-sm font-medium text-gray-900">
              {t('home.tools.recipe')}
            </div>
          </Link>
          <Link
            to="/loot-table"
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-2xl mb-2">🎲</div>
            <div className="text-sm font-medium text-gray-900">
              {t('home.tools.lootTable')}
            </div>
          </Link>
          <Link
            to="/spawn-rules"
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm font-medium text-gray-900">
              {t('home.tools.spawnRules')}
            </div>
          </Link>
          <Link
            to="/animation-controller"
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-2xl mb-2">🎬</div>
            <div className="text-sm font-medium text-gray-900">
              {t('home.tools.animationController')}
            </div>
          </Link>
          <Link
            to="/sound"
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center no-underline hover:bg-[#F0F8EA] hover:border-[#5D9C3B] transition-colors"
          >
            <div className="text-2xl mb-2">🔊</div>
            <div className="text-sm font-medium text-gray-900">
              {t('home.tools.sound')}
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page component — gates on locale
// ---------------------------------------------------------------------------

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate()
  const { locale } = useUiStore()
  const { setProject } = useProjectStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNewAddon = (): void => {
    void navigate('/wizard')
  }

  const handleOpenProject = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    void loadProjectFile(file)
      .then((data) => {
        setProject(data)
        void navigate('/editor')
      })
      .catch(() => {
        // silently ignore malformed files for now
      })
    e.target.value = ''
  }

  const handleEditProject = (): void => {
    void navigate('/editor')
  }

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      style={{ display: 'none' }}
      onChange={handleFileInputChange}
    />
  )

  if (locale === 'ja-kids') {
    return (
      <>
        <KidsHomeLayout
          onNewAddon={handleNewAddon}
          onOpenProject={handleOpenProject}
          onEditProject={handleEditProject}
        />
        {hiddenInput}
      </>
    )
  }

  return (
    <>
      <StandardHomeLayout
        onNewAddon={handleNewAddon}
        onOpenProject={handleOpenProject}
        onEditProject={handleEditProject}
      />
      {hiddenInput}
    </>
  )
}
