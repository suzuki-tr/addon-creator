import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppearancePanel } from './AppearancePanel'

describe('AppearancePanel', () => {
  it('renders without crashing', () => {
    render(createElement(AppearancePanel))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders geometry tab selected by default', () => {
    render(createElement(AppearancePanel))
    // Tab keys: editor.appearance.tabs.geometry / editor.appearance.tabs.texture
    const geometryTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.geometry' })
    expect(geometryTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders texture tab button', () => {
    render(createElement(AppearancePanel))
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    expect(textureTab).toBeTruthy()
  })

  it('material tab is not shown in simple mode', () => {
    render(createElement(AppearancePanel))
    // mode='simple' in mock — material tab is advanced-only
    expect(screen.queryByRole('tab', { name: 'editor.appearance.tabs.material' })).toBeNull()
  })

  it('switching to texture tab selects it', () => {
    render(createElement(AppearancePanel))
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    fireEvent.click(textureTab)
    expect(textureTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders 3D preview placeholder in geometry pane', () => {
    render(createElement(AppearancePanel))
    expect(screen.getByText('editor.preview3d.title')).toBeTruthy()
  })
})
