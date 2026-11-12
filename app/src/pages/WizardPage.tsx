import type { JSX } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardStep1 } from '@/components/wizard/WizardStep1'
import { WizardStep2, isValidId } from '@/components/wizard/WizardStep2'
import { WizardStep3 } from '@/components/wizard/WizardStep3'

export type ContentType = 'mob' | 'block' | 'item'
export type BaseType = 'scratch' | 'vanilla'

export interface WizardFormData {
  id: string
  displayName: string
  baseType: BaseType
  vanillaSearch: string
}

type WizardStep = 1 | 2 | 3

export const WizardPage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState<WizardStep>(1)
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [formData, setFormData] = useState<WizardFormData>({
    id: '',
    displayName: '',
    baseType: 'vanilla',
    vanillaSearch: '',
  })

  // Validation state
  const [idError, setIdError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [downloadDone, setDownloadDone] = useState(false)

  const handleFormChange = (patch: Partial<WizardFormData>): void => {
    setFormData((prev) => ({ ...prev, ...patch }))
    // Clear errors on change
    if (patch.id !== undefined) setIdError(null)
    if (patch.displayName !== undefined) setDisplayNameError(null)
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

  const handleDownload = (): void => {
    // Phase 2 placeholder: show success state
    // In full implementation, this triggers JSZip generation + file-saver download
    setDownloadDone(true)
    alert(t('export.success', { name: formData.id }))
    void navigate('/')
  }

  // Can proceed from step 1 only if a type is selected
  const canProceedStep1 = contentType !== null
  // Can proceed from step 3 (download)
  const canDownload = !downloadDone

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
          idError={idError}
          displayNameError={displayNameError}
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
            onClick={handleDownload}
            disabled={!canDownload}
            className="bg-[#5D9C3B] rounded-lg px-8 py-3 text-base font-bold text-white border-none cursor-pointer hover:bg-[#4f8832] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ⬇️ {t('wizard.confirm.download')}
          </button>
        )}
      </div>
    </div>
  )
}
