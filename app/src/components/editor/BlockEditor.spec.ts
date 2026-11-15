/**
 * BlockEditor spec — verifies that all form-state values are reflected in the JSON preview.
 * Runs with mode='advanced' so the JSON panel is rendered.
 */
import { vi, describe, it, expect } from 'vitest'

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => ({
    mode: 'advanced',
    locale: 'ja',
    setLocale: () => {},
    setMode: () => {},
  }),
}))

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { BlockEditor } from './BlockEditor'

describe('BlockEditor', () => {
  it('renders without crashing', () => {
    render(createElement(BlockEditor))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders basic tab selected by default', () => {
    render(createElement(BlockEditor))
    const tab = screen.getByRole('tab', { name: 'editor.block.tabs.basic' })
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders components tab button', () => {
    render(createElement(BlockEditor))
    expect(screen.getByRole('tab', { name: 'editor.block.tabs.components' })).toBeTruthy()
  })

  it('JSON preview contains hardness component with default state', () => {
    const { container } = render(createElement(BlockEditor))
    const text = container.textContent ?? ''
    expect(text).toContain('"minecraft:hardness"')
  })

  it('JSON preview contains friction component with default state', () => {
    const { container } = render(createElement(BlockEditor))
    const text = container.textContent ?? ''
    expect(text).toContain('"minecraft:friction"')
  })

  it('JSON preview contains light_emission component with default state', () => {
    const { container } = render(createElement(BlockEditor))
    const text = container.textContent ?? ''
    expect(text).toContain('"minecraft:light_emission"')
  })

  it('JSON preview contains destructible_by_mining component by default (enabled)', () => {
    const { container } = render(createElement(BlockEditor))
    const text = container.textContent ?? ''
    expect(text).toContain('"minecraft:destructible_by_mining"')
  })

  it('JSON preview contains the block identifier', () => {
    const { container } = render(createElement(BlockEditor))
    const text = container.textContent ?? ''
    expect(text).toContain('"myaddon:my_block"')
  })
})
