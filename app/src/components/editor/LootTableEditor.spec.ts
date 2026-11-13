import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LootTableEditor } from './LootTableEditor'

describe('LootTableEditor', () => {
  it('renders initial pool header', () => {
    render(createElement(LootTableEditor))
    expect(screen.getByText('lootTable.pool 1')).toBeTruthy()
  })

  it('add pool button is present', () => {
    render(createElement(LootTableEditor))
    const addPoolBtn = screen.getByRole('button', { name: 'lootTable.addPool' })
    expect(addPoolBtn).toBeTruthy()
  })

  it('delete entry button is present (pool starts expanded)', () => {
    render(createElement(LootTableEditor))
    const deleteEntryBtn = screen.getByRole('button', { name: 'Delete entry' })
    expect(deleteEntryBtn).toBeTruthy()
  })

  it('add entry button is present in expanded pool', () => {
    render(createElement(LootTableEditor))
    const addEntryBtn = screen.getByRole('button', { name: 'lootTable.addEntry' })
    expect(addEntryBtn).toBeTruthy()
  })

  it('clicking add pool button adds a second pool', () => {
    render(createElement(LootTableEditor))
    const addPoolBtn = screen.getByRole('button', { name: 'lootTable.addPool' })
    fireEvent.click(addPoolBtn)
    expect(screen.getByText('lootTable.pool 2')).toBeTruthy()
  })

  it('delete pool button is present in pool header', () => {
    render(createElement(LootTableEditor))
    const deletePoolBtn = screen.getByRole('button', { name: 'lootTable.deletePool' })
    expect(deletePoolBtn).toBeTruthy()
  })
})
