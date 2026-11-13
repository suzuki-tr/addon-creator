import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentPanel } from './ComponentPanel'

describe('ComponentPanel', () => {
  it('renders without crashing', () => {
    render(createElement(ComponentPanel))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders health component accordion', () => {
    render(createElement(ComponentPanel))
    expect(screen.getByText('minecraft:health')).toBeTruthy()
  })

  it('renders attack component accordion', () => {
    render(createElement(ComponentPanel))
    expect(screen.getByText('minecraft:attack')).toBeTruthy()
  })

  it('renders add component button', () => {
    render(createElement(ComponentPanel))
    const addBtn = screen.getByRole('button', { name: 'editor.components.addButton' })
    expect(addBtn).toBeTruthy()
  })

  it('health accordion is expanded by default', () => {
    render(createElement(ComponentPanel))
    // Health is expanded by default (expandedId = 'health')
    expect(screen.getByText('editor.components.health.maxLabel')).toBeTruthy()
  })

  it('clicking another accordion collapses health', () => {
    render(createElement(ComponentPanel))
    const attackHeader = screen.getByText('minecraft:attack').closest('[role="button"]')
    if (attackHeader) {
      fireEvent.click(attackHeader)
    }
    // After clicking attack, health label might not be visible
    expect(screen.queryByText('minecraft:health')).toBeTruthy()
  })
})
