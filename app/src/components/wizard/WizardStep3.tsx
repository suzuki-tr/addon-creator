import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { ContentType, WizardFormData } from '@/pages/WizardPage'
import { VANILLA_MOBS } from '@/data/vanilla-entities'

const TYPE_ICON: Record<ContentType, string> = {
  mob: '🐾',
  block: '🧱',
  item: '⚔️',
}

interface WizardStep3Props {
  data: WizardFormData
  contentType: ContentType
}

export const WizardStep3 = ({
  data,
  contentType,
}: WizardStep3Props): JSX.Element => {
  const { t } = useTranslation()

  const outputFileName = `${data.id}.mcaddon`
  const vanillaEntity = data.selectedVanillaId
    ? VANILLA_MOBS.find((e) => e.id === data.selectedVanillaId)
    : null
  const baseLabel =
    data.baseType === 'vanilla'
      ? vanillaEntity
        ? `${t('wizard.step2.fromVanilla')}（${vanillaEntity.nameJa}）`
        : t('wizard.step2.fromVanilla')
      : t('wizard.step2.fromScratch')

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('wizard.confirm.title')}
      </h1>
      <p className="text-sm text-gray-500 mb-7">{t('wizard.confirm.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary table */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-[#E5E7EB]">
            {t('wizard.confirm.summaryTitle')}
          </h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <SummaryRow
                label={t('wizard.confirm.typeLabel')}
                value={
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {TYPE_ICON[contentType]}&nbsp;
                    {t(`wizard.step1.${contentType}` as 'wizard.step1.mob' | 'wizard.step1.block' | 'wizard.step1.item')}
                  </span>
                }
              />
              <SummaryRow
                label={t('wizard.confirm.nameLabel')}
                value={
                  <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {data.id}
                  </code>
                }
              />
              <SummaryRow
                label={t('wizard.confirm.displayNameLabel')}
                value={data.displayName}
              />
              <SummaryRow
                label={t('wizard.confirm.baseLabel')}
                value={baseLabel}
              />
              <SummaryRow
                label={t('wizard.confirm.outputFileLabel')}
                value={
                  <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {outputFileName}
                  </code>
                }
              />
            </tbody>
          </table>
        </div>

        {/* Preview placeholder */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-[#E5E7EB]">
            {t('wizard.confirm.previewTitle')}
          </h3>
          <div className="aspect-square bg-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 text-sm">
            <span className="text-5xl">{TYPE_ICON[contentType]}</span>
            <span>{t('wizard.confirm.previewPlaceholder')}</span>
          </div>
        </div>
      </div>

      {/* Validation status */}
      <div className="mt-6 px-4 py-3.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
          ✓ OK
        </span>
        <span className="text-sm text-green-700">
          {t('wizard.confirm.validationOk')}
        </span>
      </div>
    </div>
  )
}

interface SummaryRowProps {
  label: string
  value: React.ReactNode
}

const SummaryRow = ({ label, value }: SummaryRowProps): JSX.Element => (
  <tr className="border-b border-gray-50">
    <th className="text-left py-2.5 px-3 text-xs text-gray-500 font-medium bg-gray-50 w-2/5">
      {label}
    </th>
    <td className="py-2.5 px-3 text-sm font-medium text-gray-900">{value}</td>
  </tr>
)
