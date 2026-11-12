import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { BaseType, WizardFormData } from '@/pages/WizardPage'

/** Convert display name to a valid ID: lowercase, spaces → underscores, strip invalid chars */
function toId(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

/** Check if ID string is valid */
export function isValidId(id: string): boolean {
  return /^[a-z0-9_]+$/.test(id)
}

interface WizardStep2Props {
  data: Pick<WizardFormData, 'id' | 'displayName' | 'baseType' | 'vanillaSearch'>
  idError: string | null
  displayNameError: string | null
  onChange: (patch: Partial<WizardFormData>) => void
}

export const WizardStep2 = ({
  data,
  idError,
  displayNameError,
  onChange,
}: WizardStep2Props): JSX.Element => {
  const { t } = useTranslation()

  const handleDisplayNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const displayName = e.target.value
    // Auto-suggest ID from display name when ID hasn't been manually edited
    const suggestedId = toId(displayName)
    onChange({ displayName, id: suggestedId })
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange({ id: e.target.value })
  }

  const handleBaseTypeChange = (baseType: BaseType): void => {
    onChange({ baseType, vanillaSearch: '' })
  }

  const handleVanillaSearch = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    onChange({ vanillaSearch: e.target.value })
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('wizard.step2.title')}
      </h1>
      <p className="text-sm text-gray-500 mb-7">{t('wizard.step2.subtitle')}</p>

      {/* Display Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {t('wizard.step2.displayNameLabel')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          value={data.displayName}
          onChange={handleDisplayNameChange}
          placeholder={t('wizard.step2.displayNamePlaceholder')}
          className={[
            'w-full px-3 py-2.5 border rounded-md text-sm text-gray-900 bg-white outline-none transition-colors',
            displayNameError
              ? 'border-red-400 focus:border-red-500'
              : 'border-[#D1D5DB] focus:border-[#5D9C3B]',
          ].join(' ')}
          aria-invalid={displayNameError !== null}
          aria-describedby={displayNameError ? 'displayName-error' : undefined}
        />
        {displayNameError ? (
          <p id="displayName-error" className="text-xs text-red-500 mt-1.5">
            {displayNameError}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1.5">
            {t('wizard.step2.displayNameHint')}
          </p>
        )}
      </div>

      {/* Addon ID */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {t('wizard.step2.nameLabel')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          value={data.id}
          onChange={handleIdChange}
          placeholder={t('wizard.step2.namePlaceholder')}
          className={[
            'w-full px-3 py-2.5 border rounded-md text-sm text-gray-900 bg-white outline-none transition-colors font-mono',
            idError
              ? 'border-red-400 focus:border-red-500'
              : 'border-[#D1D5DB] focus:border-[#5D9C3B]',
          ].join(' ')}
          aria-invalid={idError !== null}
          aria-describedby={idError ? 'id-error' : undefined}
        />
        {idError ? (
          <p id="id-error" className="text-xs text-red-500 mt-1.5">
            {idError}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1.5">{t('wizard.step2.nameHint')}</p>
        )}
      </div>

      {/* Base selection */}
      <div className="mb-2">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          {t('wizard.step2.baseLabel')}
        </div>

        {/* From scratch option */}
        <button
          type="button"
          onClick={() => handleBaseTypeChange('scratch')}
          className={[
            'w-full flex items-start gap-2.5 px-4 py-3.5 border rounded-lg mb-2.5 cursor-pointer transition-colors text-left',
            data.baseType === 'scratch'
              ? 'border-[#5D9C3B] bg-[#F0F8EA]'
              : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
          ].join(' ')}
          aria-pressed={data.baseType === 'scratch'}
        >
          {/* Radio dot */}
          <div
            className={[
              'w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
              data.baseType === 'scratch'
                ? 'border-[#5D9C3B] bg-[#5D9C3B]'
                : 'border-gray-300 bg-white',
            ].join(' ')}
            style={{ width: 18, height: 18 }}
          >
            {data.baseType === 'scratch' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">
              {t('wizard.step2.fromScratch')}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {t('wizard.step2.fromScratchDesc')}
            </div>
          </div>
        </button>

        {/* From vanilla option */}
        <button
          type="button"
          onClick={() => handleBaseTypeChange('vanilla')}
          className={[
            'w-full flex items-start gap-2.5 px-4 py-3.5 border rounded-lg cursor-pointer transition-colors text-left',
            data.baseType === 'vanilla'
              ? 'border-[#5D9C3B] bg-[#F0F8EA]'
              : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
          ].join(' ')}
          aria-pressed={data.baseType === 'vanilla'}
        >
          <div
            className={[
              'rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
              data.baseType === 'vanilla'
                ? 'border-[#5D9C3B] bg-[#5D9C3B]'
                : 'border-gray-300 bg-white',
            ].join(' ')}
            style={{ width: 18, height: 18 }}
          >
            {data.baseType === 'vanilla' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {t('wizard.step2.fromVanilla')}
              </span>
              <span className="text-xs bg-[#5D9C3B] text-white px-2 py-0.5 rounded-full font-semibold">
                {t('wizard.step2.recommendedBadge')}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {t('wizard.step2.fromVanillaDesc')}
            </div>

            {/* Expanded search when vanilla is selected */}
            {data.baseType === 'vanilla' && (
              <div
                className="mt-3 p-3.5 bg-gray-50 border border-[#E5E7EB] rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs text-gray-500 mb-2">
                  {t('wizard.step2.vanillaSearchLabel')}
                </div>
                <input
                  type="text"
                  value={data.vanillaSearch}
                  onChange={handleVanillaSearch}
                  placeholder={t('wizard.step2.searchPlaceholder')}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white focus:border-[#5D9C3B] outline-none"
                />
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
