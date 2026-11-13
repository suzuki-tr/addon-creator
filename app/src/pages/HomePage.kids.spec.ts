/**
 * HomePage tests with locale='ja-kids' to cover KidsHomeLayout component.
 * This file overrides the global uiStore mock from setup.ts.
 */
import { vi, describe, it, expect } from 'vitest'

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => ({ mode: 'simple', locale: 'ja-kids', setLocale: () => {}, setMode: () => {} }),
}))

import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { HomePage } from './HomePage'

const renderInRouter = (): void => {
  render(createElement(MemoryRouter, null, createElement(HomePage)))
}

describe('HomePage (kids locale)', () => {
  it('renders without crashing with ja-kids locale', () => {
    renderInRouter()
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders new addon button in kids layout', () => {
    renderInRouter()
    expect(screen.getAllByText('home.newAddon').length).toBeGreaterThanOrEqual(1)
  })

  it('renders recent projects section in kids layout', () => {
    renderInRouter()
    expect(screen.getAllByText('home.recentProjects').length).toBeGreaterThanOrEqual(1)
  })

  it('renders tools section in kids layout', () => {
    renderInRouter()
    expect(screen.getAllByText('home.tools.title').length).toBeGreaterThanOrEqual(1)
  })

  it('renders recipe tool link in kids layout', () => {
    renderInRouter()
    expect(screen.getAllByText('home.tools.recipe').length).toBeGreaterThanOrEqual(1)
  })
})
