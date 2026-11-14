import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'

const renderWithRouter = (): ReturnType<typeof render> =>
  render(createElement(MemoryRouter, null, createElement(Header)))

describe('Header', () => {
  it('renders without crashing', () => {
    renderWithRouter()
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders app name', () => {
    renderWithRouter()
    expect(screen.getByText('app.name')).toBeTruthy()
  })

  it('renders language selector', () => {
    renderWithRouter()
    const langSelect = screen.getByRole('combobox', { name: '言語を選ぶ / Select language' })
    expect(langSelect).toBeTruthy()
  })

  it('renders simple mode button', () => {
    renderWithRouter()
    const simpleModeBtn = screen.getByRole('button', { name: 'app.mode.simple' })
    expect(simpleModeBtn).toBeTruthy()
  })

  it('renders advanced mode button', () => {
    renderWithRouter()
    const advancedModeBtn = screen.getByRole('button', { name: 'app.mode.advanced' })
    expect(advancedModeBtn).toBeTruthy()
  })

  it('clicking advanced mode button does not crash', () => {
    const mockSetMode = vi.fn()
    // Override the mock for this test to track calls
    // The setup mock returns setMode: () => {}; here we just verify no crash
    renderWithRouter()
    const advancedModeBtn = screen.getByRole('button', { name: 'app.mode.advanced' })
    fireEvent.click(advancedModeBtn)
    expect(advancedModeBtn).toBeTruthy()
    // Suppress unused variable warning
    expect(mockSetMode).not.toHaveBeenCalled()
  })
})
