import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TraitCard } from './TraitCard'
import type { TraitCardData } from './TraitCard'

const SAMPLE_TRAIT: TraitCardData = {
  id: 'friendly',
  icon: '😊',
  name: 'Friendly',
  description: 'This mob is friendly to players.',
}

describe('TraitCard', () => {
  it('renders without crashing', () => {
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: false, onToggle: () => {} }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders trait name', () => {
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: false, onToggle: () => {} }))
    expect(screen.getByText('Friendly')).toBeTruthy()
  })

  it('renders trait description', () => {
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: false, onToggle: () => {} }))
    expect(screen.getByText('This mob is friendly to players.')).toBeTruthy()
  })

  it('renders trait icon', () => {
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: false, onToggle: () => {} }))
    expect(screen.getByText('😊')).toBeTruthy()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: false, onToggle }))
    const card = screen.getByRole('checkbox')
    fireEvent.click(card)
    expect(onToggle).toHaveBeenCalledWith('friendly')
  })

  it('shows checked state correctly', () => {
    render(createElement(TraitCard, { trait: SAMPLE_TRAIT, checked: true, onToggle: () => {} }))
    const card = screen.getByRole('checkbox')
    expect(card.getAttribute('aria-checked')).toBe('true')
  })
})
