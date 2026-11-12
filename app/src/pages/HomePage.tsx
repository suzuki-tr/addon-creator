import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

export const HomePage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('app.name')}</h1>
      <p className="text-gray-500 text-center max-w-md">
        {t('wizard.title')}
      </p>
    </div>
  )
}
