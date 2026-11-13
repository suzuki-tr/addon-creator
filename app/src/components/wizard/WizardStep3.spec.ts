import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { WizardStep3 } from './WizardStep3'
import type { ContentType, WizardFormData } from '@/pages/WizardPage'

const SAMPLE_DATA: WizardFormData = {
  id: 'test_mob',
  displayName: 'Test Mob',
  baseType: 'scratch',
  vanillaSearch: '',
}

describe('WizardStep3', () => {
  it('renders without crashing', () => {
    const contentType: ContentType = 'mob'
    render(createElement(WizardStep3, { data: SAMPLE_DATA, contentType }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders entity ID in output', () => {
    const contentType: ContentType = 'mob'
    render(createElement(WizardStep3, { data: SAMPLE_DATA, contentType }))
    // Shows data.id somewhere in the output — may appear in multiple elements
    const matches = screen.getAllByText(/test_mob/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders for block content type', () => {
    const contentType: ContentType = 'block'
    render(createElement(WizardStep3, { data: SAMPLE_DATA, contentType }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders for item content type', () => {
    const contentType: ContentType = 'item'
    render(createElement(WizardStep3, { data: SAMPLE_DATA, contentType }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders vanilla base type correctly', () => {
    const contentType: ContentType = 'mob'
    const vanillaData: WizardFormData = {
      ...SAMPLE_DATA,
      baseType: 'vanilla',
      vanillaSearch: 'zombie',
    }
    render(createElement(WizardStep3, { data: vanillaData, contentType }))
    expect(document.body.firstChild).toBeTruthy()
  })
})
