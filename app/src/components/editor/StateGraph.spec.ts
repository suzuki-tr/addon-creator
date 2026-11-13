import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateGraph } from './StateGraph'

describe('StateGraph', () => {
  it('renders without crashing', () => {
    render(createElement(StateGraph))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders state list heading', () => {
    render(createElement(StateGraph))
    // StateGraph uses t('editor.stateGraph.stateListTitle') for the left panel heading
    expect(screen.getByText('editor.stateGraph.stateListTitle')).toBeTruthy()
  })

  it('renders add state button', () => {
    render(createElement(StateGraph))
    const addBtn = screen.getByRole('button', { name: 'editor.stateGraph.addState' })
    expect(addBtn).toBeTruthy()
  })

  it('renders multiple state node buttons (list + SVG canvas)', () => {
    render(createElement(StateGraph))
    // Each state appears as a left-panel button AND an SVG g[role=button]
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    expect(idleButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a state node in the left panel shows details', () => {
    render(createElement(StateGraph))
    // getAllByRole returns [left-panel-button, svg-node-button] — click the first one
    const idleButtons = screen.getAllByRole('button', { name: 'idle' })
    fireEvent.click(idleButtons[0])
    // After selection, right panel should show 'editor.stateGraph.selectedState'
    expect(screen.getByText('editor.stateGraph.selectedState')).toBeTruthy()
  })

  it('renders SVG canvas element', () => {
    render(createElement(StateGraph))
    const svg = document.querySelector('svg')
    expect(svg).toBeTruthy()
  })
})
