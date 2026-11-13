import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { LootTableEditorPage } from './LootTableEditorPage'

describe('LootTableEditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(LootTableEditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders loot table page title', () => {
    render(createElement(LootTableEditorPage))
    expect(screen.getByText('lootTable.pageTitle')).toBeTruthy()
  })

  it('renders files sidebar with loot_table.json', () => {
    render(createElement(LootTableEditorPage))
    expect(screen.getByText('loot_table.json')).toBeTruthy()
  })

  it('renders save button', () => {
    render(createElement(LootTableEditorPage))
    const saveBtn = screen.getByRole('button', { name: /common\.button\.save/ })
    expect(saveBtn).toBeTruthy()
  })
})
