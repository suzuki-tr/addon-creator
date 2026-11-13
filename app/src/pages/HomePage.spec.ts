import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { HomePage } from './HomePage'

const renderInRouter = (): void => {
  render(createElement(MemoryRouter, null, createElement(HomePage)))
}

describe('HomePage', () => {
  it('renders without crashing', () => {
    renderInRouter()
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders new addon button', () => {
    renderInRouter()
    expect(screen.getAllByText('home.newAddon').length).toBeGreaterThanOrEqual(1)
  })

  it('renders recent projects section', () => {
    renderInRouter()
    expect(screen.getAllByText('home.recentProjects').length).toBeGreaterThanOrEqual(1)
  })

  it('renders editor tools section', () => {
    renderInRouter()
    expect(screen.getAllByText('home.tools.title').length).toBeGreaterThanOrEqual(1)
  })

  it('renders recipe editor tool link', () => {
    renderInRouter()
    expect(screen.getAllByText('home.tools.recipe').length).toBeGreaterThanOrEqual(1)
  })

  it('renders loot table editor tool link', () => {
    renderInRouter()
    expect(screen.getAllByText('home.tools.lootTable').length).toBeGreaterThanOrEqual(1)
  })
})
