import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { WizardStep2 } from './WizardStep2'
import type { WizardFormData } from '@/pages/WizardPage'

const SAMPLE_DATA: Pick<WizardFormData, 'id' | 'displayName' | 'baseType' | 'vanillaSearch'> = {
  id: 'test_mob',
  displayName: 'Test Mob',
  baseType: 'scratch',
  vanillaSearch: '',
}

describe('WizardStep2 (component)', () => {
  it('renders without crashing', () => {
    render(
      createElement(WizardStep2, {
        data: SAMPLE_DATA,
        idError: null,
        displayNameError: null,
        onChange: () => {},
      }),
    )
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders display name input', () => {
    render(
      createElement(WizardStep2, {
        data: SAMPLE_DATA,
        idError: null,
        displayNameError: null,
        onChange: () => {},
      }),
    )
    expect(screen.getByDisplayValue('Test Mob')).toBeTruthy()
  })

  it('renders entity ID input', () => {
    render(
      createElement(WizardStep2, {
        data: SAMPLE_DATA,
        idError: null,
        displayNameError: null,
        onChange: () => {},
      }),
    )
    expect(screen.getByDisplayValue('test_mob')).toBeTruthy()
  })

  it('renders id error when provided', () => {
    render(
      createElement(WizardStep2, {
        data: { ...SAMPLE_DATA, id: 'bad id' },
        idError: 'wizard.error.invalidId',
        displayNameError: null,
        onChange: () => {},
      }),
    )
    expect(screen.getByText('wizard.error.invalidId')).toBeTruthy()
  })

  it('renders vanilla base type option', () => {
    render(
      createElement(WizardStep2, {
        data: SAMPLE_DATA,
        idError: null,
        displayNameError: null,
        onChange: () => {},
      }),
    )
    expect(screen.getByText('wizard.step2.fromVanilla')).toBeTruthy()
  })
})
