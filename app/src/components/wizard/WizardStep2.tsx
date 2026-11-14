import type { JSX } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BaseType, WizardFormData } from '@/pages/WizardPage'
import { VANILLA_MOBS, matchesSearch } from '@/data/vanilla-entities'

/** Convert display name to a valid ID: lowercase, spaces → underscores, strip invalid chars */
export function toId(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

/** Check if ID string is valid: must contain at least one alphanumeric character */
export function isValidId(id: string): boolean {
  return /^[a-z0-9_]*[a-z0-9][a-z0-9_]*$/.test(id)
}

interface WizardStep2Props {
  data: Pick<WizardFormData, 'id' | 'displayName' | 'baseType' | 'vanillaSearch' | 'selectedVanillaId'>
  idError: string | null
  displayNameError: string | null
  vanillaEntityError: string | null
  onChange: (patch: Partial<WizardFormData>) => void
}

export const WizardStep2 = ({
  data,
  idError,
  displayNameError,
  vanillaEntityError,
  onChange,
}: WizardStep2Props): JSX.Element => {
  const { t } = useTranslation()

  const filteredEntities = useMemo(
    () =>
      data.vanillaSearch.trim()
        ? VANILLA_MOBS.filter((e) => matchesSearch(e, data.vanillaSearch.trim()))
        : VANILLA_MOBS,
    [data.vanillaSearch],
  )

  const handleDisplayNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const displayName = e.target.value
    // Auto-suggest ID from display name, but skip when toId() strips all
    // characters (e.g. Japanese-only input) to avoid overwriting with "".
    const suggestedId = toId(displayName)
    onChange({ displayName, ...(suggestedId && isValidId(suggestedId) ? { id: suggestedId } : {}) })
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange({ id: e.target.value })
  }

  const handleBaseTypeChange = (baseType: BaseType): void => {
    onChange({ baseType, vanillaSearch: '', selectedVanillaId: null })
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

        {/*
         * HTML5 forbids interactive content (input, button, etc.) inside <button>.
         * Both options use div+role="radio" so the vanilla search <input> is valid.
         */}
        <div role="radiogroup" aria-label={t('wizard.step2.baseLabel')}>
          {/* From scratch option */}
          <div
            role="radio"
            aria-checked={data.baseType === 'scratch'}
            tabIndex={0}
            onClick={() => handleBaseTypeChange('scratch')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleBaseTypeChange('scratch')
              }
            }}
            className={[
              'w-full flex items-start gap-2.5 px-4 py-3.5 border rounded-lg mb-2.5 cursor-pointer transition-colors',
              data.baseType === 'scratch'
                ? 'border-[#5D9C3B] bg-[#F0F8EA]'
                : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
            ].join(' ')}
          >
            {/* Radio dot */}
            <div
              className={[
                'rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
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
          </div>

          {/* From vanilla option */}
          <div
            role="radio"
            aria-checked={data.baseType === 'vanilla'}
            tabIndex={0}
            onClick={() => handleBaseTypeChange('vanilla')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleBaseTypeChange('vanilla')
              }
            }}
            className={[
              'w-full flex items-start gap-2.5 px-4 py-3.5 border rounded-lg cursor-pointer transition-colors',
              data.baseType === 'vanilla'
                ? 'border-[#5D9C3B] bg-[#F0F8EA]'
                : 'border-[#E5E7EB] bg-white hover:border-[#5D9C3B]',
            ].join(' ')}
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

              {/* Expanded search when vanilla is selected.
                  stopPropagation prevents clicks inside the search area from
                  re-triggering handleBaseTypeChange and clearing vanillaSearch. */}
              {data.baseType === 'vanilla' && (
                <div
                  className="mt-3 p-3.5 bg-gray-50 border border-[#E5E7EB] rounded-md"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <div className="text-xs text-gray-500 mb-2">
                    {t('wizard.step2.vanillaSearchLabel')}
                  </div>
                  <input
                    type="text"
                    value={data.vanillaSearch}
                    onChange={handleVanillaSearch}
                    placeholder={t('wizard.step2.searchPlaceholder')}
                    className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white focus:border-[#5D9C3B] outline-none mb-2"
                  />

                  {/* Filtered entity list */}
                  <div
                    role="listbox"
                    aria-label={t('wizard.step2.vanillaSearchLabel')}
                    className="max-h-48 overflow-y-auto border border-[#E5E7EB] rounded-md bg-white"
                  >
                    {filteredEntities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        role="option"
                        data-testid={`vanilla-entity-${entity.id}`}
                        aria-selected={data.selectedVanillaId === entity.id}
                        onClick={() => onChange({ selectedVanillaId: entity.id })}
                        className={[
                          'w-full flex items-center gap-2 px-3 py-2 text-left text-sm border-b border-[#F3F4F6] last:border-b-0 transition-colors cursor-pointer',
                          data.selectedVanillaId === entity.id
                            ? 'bg-[#F0F8EA] border-l-2 border-l-[#5D9C3B]'
                            : 'bg-white hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span>{entity.icon}</span>
                        <span className="font-medium">{entity.nameJa}</span>
                        <span className="text-xs text-gray-400 ml-1">({entity.nameEn})</span>
                      </button>
                    ))}
                    {filteredEntities.length === 0 && data.vanillaSearch.trim() && (
                      <p className="text-xs text-gray-400 p-3 text-center">
                        {t('wizard.step2.noResults')}
                      </p>
                    )}
                  </div>

                  {/* Vanilla entity validation error */}
                  {vanillaEntityError && (
                    <p className="text-xs text-red-500 mt-1.5">{vanillaEntityError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
