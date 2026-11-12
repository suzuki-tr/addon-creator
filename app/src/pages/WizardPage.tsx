import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

export const WizardPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900">{t('wizard.title')}</h2>
      <p className="text-gray-500">{t('wizard.step1.title')}</p>
    </div>
  )
}
