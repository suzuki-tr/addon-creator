import type { JSX } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardStep1 } from '@/components/wizard/WizardStep1'
import { WizardStep2, isValidId } from '@/components/wizard/WizardStep2'
import { WizardStep3 } from '@/components/wizard/WizardStep3'
import { useProjectStore } from '@/stores/projectStore'
import type { ProjectData } from '@/stores/projectStore'
import { VANILLA_MOBS, VANILLA_ITEMS, VANILLA_BLOCKS } from '@/data/vanilla-entities'

export type ContentType = 'mob' | 'block' | 'item'
export type BaseType = 'scratch' | 'vanilla'

export interface WizardFormData {
  id: string
  displayName: string
  baseType: BaseType
  vanillaSearch: string
  selectedVanillaId: string | null
}

type WizardStep = 1 | 2 | 3

export const WizardPage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setProject } = useProjectStore()

  const [step, setStep] = useState<WizardStep>(1)
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [formData, setFormData] = useState<WizardFormData>({
    id: '',
    displayName: '',
    baseType: 'vanilla',
    vanillaSearch: '',
    selectedVanillaId: null,
  })

  // Validation state
  const [idError, setIdError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [vanillaEntityError, setVanillaEntityError] = useState<string | null>(null)

  const handleFormChange = (patch: Partial<WizardFormData>): void => {
    setFormData((prev) => ({ ...prev, ...patch }))
    // Clear errors on change
    if (patch.id !== undefined) setIdError(null)
    if (patch.displayName !== undefined) setDisplayNameError(null)
    if (patch.selectedVanillaId !== undefined) setVanillaEntityError(null)
    if (patch.baseType !== undefined) setVanillaEntityError(null)
  }

  const validateStep2 = (): boolean => {
    let valid = true

    if (!formData.displayName.trim()) {
      setDisplayNameError(t('error.validation.nameEmpty'))
      valid = false
    }

    if (!formData.id.trim()) {
      setIdError(t('error.validation.nameEmpty'))
      valid = false
    } else if (!isValidId(formData.id)) {
      setIdError(t('error.validation.nameInvalidChars'))
      valid = false
    }

    if (formData.baseType === 'vanilla' && !formData.selectedVanillaId) {
      setVanillaEntityError(t('error.validation.vanillaEntityRequired'))
      valid = false
    }

    return valid
  }

  const handleNext = (): void => {
    if (step === 1 && contentType !== null) {
      setStep(2)
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
      }
    }
  }

  const handleBack = (): void => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const handleCancel = (): void => {
    void navigate('/')
  }

  const handleProceedToEditor = (): void => {
    // Look up the vanilla entity's default components for the selected content type
    const vanillaList =
      contentType === 'item' ? VANILLA_ITEMS :
      contentType === 'block' ? VANILLA_BLOCKS :
      VANILLA_MOBS
    const vanillaEntity = formData.selectedVanillaId
      ? vanillaList.find((v) => v.id === formData.selectedVanillaId)
      : null

    const projectData: ProjectData = {
      entityId: formData.id,
      entityDisplayName: formData.displayName,
      // contentType is non-null here: step 3 is only reachable when contentType !== null
      contentType: contentType!,
      baseType: formData.baseType,
      selectedVanillaId: formData.selectedVanillaId,
      selectedTraits: [],
      status: {
        health: vanillaEntity?.defaultComponents?.health ?? vanillaEntity?.defaultHealth ?? 20,
        attackDamage: vanillaEntity?.defaultComponents?.attackDamage ?? 3,
        movementSpeed: vanillaEntity?.defaultComponents?.movementSpeed ?? 0.25,
        scale: 1.0,
      },
      // UUIDs generated once so repeated saves don't create new pack identities in Minecraft
      manifestUuid: crypto.randomUUID(),
      moduleUuid: crypto.randomUUID(),
      rpManifestUuid: crypto.randomUUID(),
      rpModuleUuid: crypto.randomUUID(),
    }

    setProject(projectData)
    void navigate('/editor')
  }

  // Can proceed from step 1 only if a type is selected
  const canProceedStep1 = contentType !== null

  return (
    <div className="max-w-[900px] mx-auto py-8 px-6">
      <WizardProgress currentStep={step} />

      {step === 1 && (
        <WizardStep1
          selected={contentType}
          onSelect={setContentType}
        />
      )}

      {step === 2 && (
        <WizardStep2
          data={formData}
          contentType={contentType ?? 'mob'}
          idError={idError}
          displayNameError={displayNameError}
          vanillaEntityError={vanillaEntityError}
          onChange={handleFormChange}
        />
      )}

      {step === 3 && contentType !== null && (
        <WizardStep3
          data={formData}
          contentType={contentType}
        />
      )}

      {/* Navigation bar */}
      <div className="flex justify-between items-center">
        {step === 1 ? (
          <button
            type="button"
            onClick={handleCancel}
            className="border border-[#D1D5DB] rounded-md px-5 py-2.5 text-sm text-gray-500 bg-white cursor-pointer hover:bg-gray-50"
          >
            {t('common.button.cancel')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="border border-[#D1D5DB] rounded-md px-5 py-2.5 text-sm text-gray-500 bg-white cursor-pointer hover:bg-gray-50"
          >
            ← {t('common.button.back')}
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && !canProceedStep1}
            className={[
              'rounded-md px-7 py-2.5 text-sm font-semibold text-white border-none',
              step === 1 && !canProceedStep1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#5D9C3B] cursor-pointer hover:bg-[#4f8832]',
            ].join(' ')}
          >
            {t('common.button.next')} →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleProceedToEditor}
            className="bg-[#5D9C3B] rounded-lg px-8 py-3 text-base font-bold text-white border-none cursor-pointer hover:bg-[#4f8832]"
          >
            ✏️ {t('wizard.confirm.proceed')}
          </button>
        )}
      </div>
    </div>
  )
}
