import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { WizardProgress } from './WizardProgress'

describe('WizardProgress', () => {
  it('renders without crashing', () => {
    render(createElement(WizardProgress, { currentStep: 1 }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders progress text for step 1', () => {
    render(createElement(WizardProgress, { currentStep: 1 }))
    // t('wizard.progress', ...) returns key string
    expect(screen.getByText('wizard.progress')).toBeTruthy()
  })

  it('renders step labels', () => {
    render(createElement(WizardProgress, { currentStep: 1 }))
    // Steps use wizard.step1.title, wizard.step2.title, wizard.confirm.title
    expect(screen.getByText('wizard.step1.title')).toBeTruthy()
  })

  it('renders for step 2', () => {
    render(createElement(WizardProgress, { currentStep: 2 }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders for step 3', () => {
    render(createElement(WizardProgress, { currentStep: 3 }))
    expect(document.body.firstChild).toBeTruthy()
  })
})
