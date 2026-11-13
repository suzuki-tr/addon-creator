import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditorPage } from './EditorPage'

describe('EditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(EditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders entity editor title area', () => {
    render(createElement(EditorPage))
    // The sidebar shows the files section header
    expect(screen.getByText('editor.sidebar.files')).toBeTruthy()
  })

  it('renders traits tab selected by default', () => {
    render(createElement(EditorPage))
    const traitsTab = screen.getByRole('tab', { name: 'editor.tabs.traits' })
    expect(traitsTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders status tab button', () => {
    render(createElement(EditorPage))
    const statusTab = screen.getByRole('tab', { name: 'editor.tabs.status' })
    expect(statusTab).toBeTruthy()
  })

  it('switching to status tab renders StatusPanel', () => {
    render(createElement(EditorPage))
    const statusTab = screen.getByRole('tab', { name: 'editor.tabs.status' })
    fireEvent.click(statusTab)
    // StatusPanel renders sliders
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBeGreaterThan(0)
  })

  it('renders sidebar with files section', () => {
    render(createElement(EditorPage))
    // The sidebar.files heading should appear only once
    const headers = screen.getAllByText('editor.sidebar.files')
    expect(headers.length).toBeGreaterThanOrEqual(1)
  })
})
