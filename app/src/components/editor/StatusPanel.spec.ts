import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusPanel } from './StatusPanel'

describe('StatusPanel', () => {
  it('renders health range slider with default value 20', () => {
    render(createElement(StatusPanel))
    const slider = screen.getByRole('slider', { name: 'entity.status.health' })
    expect((slider as HTMLInputElement).value).toBe('20')
  })

  it('renders all 4 stat sliders', () => {
    render(createElement(StatusPanel))
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(4)
  })

  it('reset button restores health slider to default value 20', () => {
    render(createElement(StatusPanel))
    const slider = screen.getByRole('slider', { name: 'entity.status.health' })
    fireEvent.change(slider, { target: { value: '100' } })
    expect((slider as HTMLInputElement).value).toBe('100')
    const resetButtons = screen.getAllByRole('button', { name: 'editor.status.resetDefault' })
    fireEvent.click(resetButtons[0])
    expect((slider as HTMLInputElement).value).toBe('20')
  })

  it('renders 4 number inputs synced with sliders', () => {
    render(createElement(StatusPanel))
    const numberInputs = screen.getAllByRole('spinbutton')
    expect(numberInputs).toHaveLength(4)
  })

  it('renders heading text', () => {
    render(createElement(StatusPanel))
    expect(screen.getByText('editor.status.heading')).toBeTruthy()
  })

  it('renders 4 reset buttons', () => {
    render(createElement(StatusPanel))
    const resetButtons = screen.getAllByRole('button', { name: 'editor.status.resetDefault' })
    expect(resetButtons).toHaveLength(4)
  })
})
