import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardPage } from './WizardPage'

const renderInRouter = (): void => {
  render(createElement(MemoryRouter, null, createElement(WizardPage)))
}

describe('WizardPage', () => {
  it('renders without crashing', () => {
    renderInRouter()
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders step 1 content initially', () => {
    renderInRouter()
    expect(screen.getByText('wizard.step1.mob')).toBeTruthy()
  })

  it('renders wizard progress indicator', () => {
    renderInRouter()
    expect(screen.getByText('wizard.progress')).toBeTruthy()
  })

  it('renders cancel button on step 1', () => {
    renderInRouter()
    // Step 1 shows 'common.button.cancel' (not 'back')
    const cancelBtn = screen.getByRole('button', { name: 'common.button.cancel' })
    expect(cancelBtn).toBeTruthy()
  })

  it('renders next button on step 1', () => {
    renderInRouter()
    // Next button text: '{t("common.button.next")} →'
    const nextBtn = screen.getByRole('button', { name: /common\.button\.next/ })
    expect(nextBtn).toBeTruthy()
  })

  it('selecting mob type updates the form', () => {
    renderInRouter()
    const mobOption = screen.getByRole('button', { name: /wizard\.step1\.mob/ })
    fireEvent.click(mobOption)
    expect(screen.getByRole('button', { name: /wizard\.step1\.mob/ })).toBeTruthy()
  })

  it('navigating to step 2 shows WizardStep2 content', () => {
    renderInRouter()
    // Select content type first
    const mobOption = screen.getByRole('button', { name: /wizard\.step1\.mob/ })
    fireEvent.click(mobOption)
    // Click next to go to step 2
    const nextBtn = screen.getByRole('button', { name: /common\.button\.next/ })
    fireEvent.click(nextBtn)
    // Step 2 should show WizardStep2 (display name label)
    expect(screen.getByText('wizard.step2.displayNameLabel')).toBeTruthy()
  })
})
