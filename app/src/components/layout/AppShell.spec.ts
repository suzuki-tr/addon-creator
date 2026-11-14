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
})
