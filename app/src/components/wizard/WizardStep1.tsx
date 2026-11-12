import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { ContentType } from '@/pages/WizardPage'

interface TypeOption {
  type: ContentType
  icon: string
  nameKey: 'wizard.step1.mob' | 'wizard.step1.block' | 'wizard.step1.item'
  descKey:
    | 'wizard.step1.mobDesc'
    | 'wizard.step1.blockDesc'
    | 'wizard.step1.itemDesc'
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'mob',
    icon: '🐾',
    nameKey: 'wizard.step1.mob',
    descKey: 'wizard.step1.mobDesc',
  },
  {
    type: 'block',
    icon: '🧱',
    nameKey: 'wizard.step1.block',
    descKey: 'wizard.step1.blockDesc',
  },
  {
    type: 'item',
    icon: '⚔️',
    nameKey: 'wizard.step1.item',
    descKey: 'wizard.step1.itemDesc',
  },
]

interface WizardStep1Props {
  selected: ContentType | null
  onSelect: (type: ContentType) => void
}

export const WizardStep1 = ({
  selected,
  onSelect,
}: WizardStep1Props): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('wizard.step1.title')}
      </h1>
      <p className="text-sm text-gray-500 mb-7">{t('wizard.step1.subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TYPE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.type
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              className={[
                'border-2 rounded-xl px-5 py-6 text-center cursor-pointer transition-colors',
                isSelected
                  ? 'border-[#5D9C3B] bg-[#F0F8EA]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span className="inline-block bg-[#5D9C3B] text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2.5">
                  {t('wizard.step1.selectedBadge')}
                </span>
              )}
              {/* Icon placeholder */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3.5 flex items-center justify-center text-2xl">
                {opt.icon}
              </div>
              <div className="text-base font-bold text-gray-900 mb-2">
                {t(opt.nameKey)}
              </div>
              <div className="text-xs text-gray-500 leading-snug">
                {t(opt.descKey)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
