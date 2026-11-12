import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

export type WizardStepNumber = 1 | 2 | 3

interface StepMeta {
  label: string
}

interface WizardProgressProps {
  currentStep: WizardStepNumber
  totalSteps: number
}

export const WizardProgress = ({
  currentStep,
  totalSteps,
}: WizardProgressProps): JSX.Element => {
  const { t } = useTranslation()

  const steps: StepMeta[] = [
    { label: t('wizard.step1.title') },
    { label: t('wizard.step2.title') },
    { label: t('wizard.confirm.title') },
  ]

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-6">
      <div className="text-xs text-gray-500 mb-3">
        {t('wizard.progress', { current: currentStep, total: totalSteps })}
      </div>

      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNum = (index + 1) as WizardStepNumber
          const isDone = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              {/* Step dot */}
              <div
                className={[
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                  isDone
                    ? 'bg-[#5D9C3B] border-[#5D9C3B] text-white'
                    : isCurrent
                      ? 'bg-[#5D9C3B] border-[#5D9C3B] text-white'
                      : 'bg-white border-gray-300 text-gray-400',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? '✓' : stepNum}
              </div>

              {/* Step name */}
              <span
                className={[
                  'text-xs whitespace-nowrap mx-1.5',
                  isDone
                    ? 'text-[#5D9C3B]'
                    : isCurrent
                      ? 'text-[#5D9C3B] font-semibold'
                      : 'text-gray-400',
                ].join(' ')}
              >
                {step.label}
              </span>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    'flex-1 h-0.5',
                    isDone ? 'bg-[#5D9C3B]' : 'bg-gray-200',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
