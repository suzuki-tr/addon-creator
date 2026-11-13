import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { SpawnRulesEditorPage } from './SpawnRulesEditorPage'

describe('SpawnRulesEditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(SpawnRulesEditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders spawn rules page title', () => {
    render(createElement(SpawnRulesEditorPage))
    expect(screen.getByText('spawnRules.pageTitle')).toBeTruthy()
  })

  it('renders files sidebar with spawn_rules.json', () => {
    render(createElement(SpawnRulesEditorPage))
    expect(screen.getByText('spawn_rules.json')).toBeTruthy()
  })

  it('renders save button', () => {
    render(createElement(SpawnRulesEditorPage))
    // button text includes emoji: '💾 common.button.save'
    const saveBtn = screen.getByRole('button', { name: /common\.button\.save/ })
    expect(saveBtn).toBeTruthy()
  })
})
