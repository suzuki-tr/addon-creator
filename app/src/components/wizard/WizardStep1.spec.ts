import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStep1 } from './WizardStep1'

describe('WizardStep1', () => {
  it('renders without crashing', () => {
    render(createElement(WizardStep1, { selected: null, onSelect: () => {} }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders mob option', () => {
    render(createElement(WizardStep1, { selected: null, onSelect: () => {} }))
    expect(screen.getByText('wizard.step1.mob')).toBeTruthy()
  })

  it('renders block option', () => {
    render(createElement(WizardStep1, { selected: null, onSelect: () => {} }))
    expect(screen.getByText('wizard.step1.block')).toBeTruthy()
  })

  it('renders item option', () => {
    render(createElement(WizardStep1, { selected: null, onSelect: () => {} }))
    expect(screen.getByText('wizard.step1.item')).toBeTruthy()
  })

  it('calls onSelect when mob card is clicked', () => {
    const onSelect = vi.fn()
    render(createElement(WizardStep1, { selected: null, onSelect }))
    const mobCard = screen.getByRole('button', { name: /wizard\.step1\.mob/ })
    fireEvent.click(mobCard)
    expect(onSelect).toHaveBeenCalledWith('mob')
  })

  it('renders with selected mob', () => {
    render(createElement(WizardStep1, { selected: 'mob', onSelect: () => {} }))
    expect(document.body.firstChild).toBeTruthy()
  })
})
