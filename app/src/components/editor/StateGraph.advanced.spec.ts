/**
 * StateGraph tests with mode='advanced' to cover Variables and EventTriggers sections.
 * This file overrides the global uiStore mock from setup.ts.
 */
import { vi, describe, it, expect } from 'vitest'

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => ({ mode: 'advanced', locale: 'ja', setLocale: () => {}, setMode: () => {} }),
}))

import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateGraph } from './StateGraph'

describe('StateGraph (advanced mode)', () => {
  it('renders without crashing in advanced mode', () => {
    render(createElement(StateGraph))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders Variables section heading in advanced mode', () => {
    render(createElement(StateGraph))
    // Click a state to show right panel
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    fireEvent.click(idleButtons[0])
    expect(screen.getByText('editor.stateGraph.variables')).toBeTruthy()
  })

  it('renders EventTriggers section in advanced mode', () => {
    render(createElement(StateGraph))
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    fireEvent.click(idleButtons[0])
    expect(screen.getByText('editor.stateGraph.eventTriggers')).toBeTruthy()
  })

  it('clicking add variable button shows variable row', () => {
    render(createElement(StateGraph))
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    fireEvent.click(idleButtons[0])
    const addVarBtn = screen.getByRole('button', { name: 'editor.stateGraph.addVariable' })
    fireEvent.click(addVarBtn)
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })

  it('clicking add event button shows event row', () => {
    render(createElement(StateGraph))
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    fireEvent.click(idleButtons[0])
    const addEventBtns = screen.getAllByRole('button', { name: 'editor.stateGraph.addEvent' })
    fireEvent.click(addEventBtns[0])
    // event row input should appear
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })
})
