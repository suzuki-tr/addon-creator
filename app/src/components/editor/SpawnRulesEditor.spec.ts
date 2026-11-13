import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { SpawnRulesEditor } from './SpawnRulesEditor'

describe('SpawnRulesEditor', () => {
  it('renders entity id input with placeholder', () => {
    render(createElement(SpawnRulesEditor))
    const entityInput = screen.getByPlaceholderText('minecraft:zombie')
    expect(entityInput).toBeTruthy()
  })

  it('renders surface spawn checkbox checked by default', () => {
    render(createElement(SpawnRulesEditor))
    const surfaceCheckbox = screen.getByRole('checkbox', { name: 'spawnRules.onSurface' })
    expect((surfaceCheckbox as HTMLInputElement).checked).toBe(true)
  })

  it('renders biome filter section heading', () => {
    render(createElement(SpawnRulesEditor))
    expect(screen.getByText('spawnRules.biomeFilter')).toBeTruthy()
  })

  it('renders default plains biome tag', () => {
    render(createElement(SpawnRulesEditor))
    expect(screen.getByText('plains')).toBeTruthy()
  })

  it('underground checkbox is unchecked by default', () => {
    render(createElement(SpawnRulesEditor))
    const undergroundCheckbox = screen.getByRole('checkbox', { name: 'spawnRules.underground' })
    expect((undergroundCheckbox as HTMLInputElement).checked).toBe(false)
  })

  it('renders difficulty filter section heading', () => {
    render(createElement(SpawnRulesEditor))
    expect(screen.getByText('spawnRules.difficultyFilter')).toBeTruthy()
  })

  it('time of day section is hidden in simple mode', () => {
    render(createElement(SpawnRulesEditor))
    // mode is 'simple' per setup.ts mock — Time of Day is advanced-only
    const timeOfDayEl = screen.queryByText('spawnRules.timeOfDay')
    expect(timeOfDayEl).toBeNull()
  })
})
