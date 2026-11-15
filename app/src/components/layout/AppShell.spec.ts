import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './AppShell'

const renderWithRouter = (props: { children: string; noPadding?: boolean }): ReturnType<typeof render> =>
  render(createElement(MemoryRouter, null, createElement(AppShell, props)))

describe('AppShell', () => {
  it('renders without crashing', () => {
    renderWithRouter({ children: 'test content' })
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders children content', () => {
    renderWithRouter({ children: 'test content' })
    expect(screen.getByText('test content')).toBeTruthy()
  })

  it('renders header with app name', () => {
    renderWithRouter({ children: 'content' })
    expect(screen.getByText('app.name')).toBeTruthy()
  })

  it('renders with noPadding flag', () => {
    renderWithRouter({ noPadding: true, children: 'padded content' })
    expect(screen.getByText('padded content')).toBeTruthy()
  })

  it('root element uses h-screen and overflow-hidden to bound layout to viewport', () => {
    // h-screen caps the height; overflow-hidden prevents the page-level scroll that
    // used to occur with min-h-screen when JSON content grew.
    const { container } = renderWithRouter({ children: 'content' })
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('h-screen')
    expect(root.className).toContain('overflow-hidden')
  })

  it('noPadding main uses overflow-hidden for editor flex chain', () => {
    const { container } = renderWithRouter({ noPadding: true, children: 'content' })
    const root = container.firstChild as HTMLElement
    const main = root.querySelector('main')
    expect(main?.className).toContain('overflow-hidden')
  })

  it('regular main uses overflow-y-auto so non-editor pages scroll independently', () => {
    const { container } = renderWithRouter({ children: 'content' })
    const root = container.firstChild as HTMLElement
    const main = root.querySelector('main')
    expect(main?.className).toContain('overflow-y-auto')
  })
})
