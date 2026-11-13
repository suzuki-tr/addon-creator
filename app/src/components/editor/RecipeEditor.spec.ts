import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecipeEditor } from './RecipeEditor'

describe('RecipeEditor', () => {
  it('renders shaped tab selected by default', () => {
    render(createElement(RecipeEditor))
    const shapedTab = screen.getByRole('tab', { name: 'recipe.tabs.shaped' })
    expect(shapedTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders shapeless and furnace tabs not selected by default', () => {
    render(createElement(RecipeEditor))
    const shapelessTab = screen.getByRole('tab', { name: 'recipe.tabs.shapeless' })
    const furnaceTab = screen.getByRole('tab', { name: 'recipe.tabs.furnace' })
    expect(shapelessTab.getAttribute('aria-selected')).toBe('false')
    expect(furnaceTab.getAttribute('aria-selected')).toBe('false')
  })

  it('renders 9 slot buttons in shaped mode', () => {
    render(createElement(RecipeEditor))
    const slotButtons = screen.getAllByRole('button', { name: 'recipe.empty' })
    expect(slotButtons).toHaveLength(9)
  })

  it('renders pattern label in shaped mode', () => {
    render(createElement(RecipeEditor))
    expect(screen.getByText('recipe.pattern')).toBeTruthy()
  })

  it('switching to shapeless tab selects that tab', () => {
    render(createElement(RecipeEditor))
    const shapelessTab = screen.getByRole('tab', { name: 'recipe.tabs.shapeless' })
    fireEvent.click(shapelessTab)
    expect(shapelessTab.getAttribute('aria-selected')).toBe('true')
  })

  it('switching to shapeless tab renders add ingredient button', () => {
    render(createElement(RecipeEditor))
    const shapelessTab = screen.getByRole('tab', { name: 'recipe.tabs.shapeless' })
    fireEvent.click(shapelessTab)
    const addIngredientBtn = screen.getByRole('button', { name: 'recipe.addIngredient' })
    expect(addIngredientBtn).toBeTruthy()
  })

  it('switching to furnace tab renders cook time label', () => {
    render(createElement(RecipeEditor))
    const furnaceTab = screen.getByRole('tab', { name: 'recipe.tabs.furnace' })
    fireEvent.click(furnaceTab)
    expect(screen.getByText('recipe.cookTime')).toBeTruthy()
  })

  it('switching to furnace tab renders experience label', () => {
    render(createElement(RecipeEditor))
    const furnaceTab = screen.getByRole('tab', { name: 'recipe.tabs.furnace' })
    fireEvent.click(furnaceTab)
    expect(screen.getByText('recipe.experience')).toBeTruthy()
  })
})
