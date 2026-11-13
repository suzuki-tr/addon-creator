import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { RecipeEditorPage } from './RecipeEditorPage'

describe('RecipeEditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(RecipeEditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders recipe page title', () => {
    render(createElement(RecipeEditorPage))
    expect(screen.getByText('recipe.pageTitle')).toBeTruthy()
  })

  it('renders files sidebar', () => {
    render(createElement(RecipeEditorPage))
    expect(screen.getByText('recipe.json')).toBeTruthy()
  })

  it('renders save button', () => {
    render(createElement(RecipeEditorPage))
    const saveBtn = screen.getByRole('button', { name: /common\.button\.save/ })
    expect(saveBtn).toBeTruthy()
  })
})
