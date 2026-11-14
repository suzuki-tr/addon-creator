import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useUiStore } from '@/stores/uiStore'
import type { UIMode, SupportedLocale } from '@/stores/uiStore'
import i18n from '@/i18n'

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  ja: '日本語',
  'ja-kids': 'かんたん日本語',
  en: 'English',
}

export const Header = (): JSX.Element => {
  const { t } = useTranslation()
  const { locale, mode, setLocale, setMode } = useUiStore()

  const handleLocaleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextLocale = event.target.value as SupportedLocale
    setLocale(nextLocale)
    void i18n.changeLanguage(nextLocale)
  }

  const handleModeClick = (nextMode: UIMode): void => {
    setMode(nextMode)
  }

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-6 py-2.5">
      <div className="max-w-[1200px] mx-auto flex items-center gap-4">
        {/* Logo / App name */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
          <span className="text-lg font-bold text-[#5D9C3B]">🎮</span>
          <span className="text-sm font-semibold text-gray-800">
            {t('app.name')}
          </span>
        </Link>

        <div className="flex-1" />

        {/* Mode toggle — hidden when locale is ja-kids (wireframe #07) */}
        {locale !== 'ja-kids' && (
          <div
            className="flex border border-[#D1D5DB] rounded-md overflow-hidden"
            role="group"
            aria-label={
              mode === 'simple'
                ? t('app.mode.toggleToAdvanced')
                : t('app.mode.toggleToSimple')
            }
          >
            {/* Simple: green active, Advanced: dark (#374151) active — wireframe #06 */}
            <button
              type="button"
              onClick={() => handleModeClick('simple')}
              className={
                `px-3.5 py-1.5 text-xs font-medium border-none cursor-pointer transition-colors` +
                (mode === 'simple'
                  ? ' bg-[#5D9C3B] text-white font-semibold'
                  : ' bg-gray-100 text-gray-500 hover:bg-gray-200')
              }
              aria-pressed={mode === 'simple'}
            >
              {t('app.mode.simple')}
            </button>
            <button
              type="button"
              onClick={() => handleModeClick('advanced')}
              className={
                `px-3.5 py-1.5 text-xs font-medium border-none cursor-pointer transition-colors` +
                (mode === 'advanced'
                  ? ' bg-[#374151] text-white font-semibold'
                  : ' bg-gray-100 text-gray-500 hover:bg-gray-200')
              }
              aria-pressed={mode === 'advanced'}
            >
              {t('app.mode.advanced')}
            </button>
          </div>
        )}

        {/* Language selector — wireframe #07: larger green-bordered variant for ja-kids */}
        <select
          value={locale}
          onChange={handleLocaleChange}
          aria-label="言語を選ぶ / Select language"
          className={
            locale === 'ja-kids'
              ? 'px-3.5 py-2 border-2 border-[#5D9C3B] rounded-lg text-base font-semibold bg-white text-gray-700 cursor-pointer'
              : 'px-2.5 py-1.5 border border-[#D1D5DB] rounded text-sm bg-white text-gray-700 cursor-pointer'
          }
        >
          {(Object.entries(LOCALE_LABELS) as [SupportedLocale, string][]).map(
            ([lang, label]) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ),
          )}
        </select>
      </div>
    </header>
  )
}
