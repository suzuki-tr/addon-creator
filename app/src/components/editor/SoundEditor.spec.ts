import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { SoundEditor } from './SoundEditor'

describe('SoundEditor', () => {
  it('renders without crashing', () => {
    render(createElement(SoundEditor))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders sound identifier input with default value', () => {
    render(createElement(SoundEditor))
    const idInput = screen.getByDisplayValue('mob.entity.my_mob.ambient')
    expect(idInput).toBeTruthy()
  })

  it('renders category select with default value neutral', () => {
    render(createElement(SoundEditor))
    const categorySelect = screen.getByDisplayValue('sound.categories.neutral')
    expect(categorySelect).toBeTruthy()
  })

  it('renders files section heading', () => {
    render(createElement(SoundEditor))
    expect(screen.getByText('sound.files')).toBeTruthy()
  })

  it('renders add file button', () => {
    render(createElement(SoundEditor))
    const addFileBtn = screen.getByRole('button', { name: 'sound.addFile' })
    expect(addFileBtn).toBeTruthy()
  })

  it('renders is3D and loop toggle switches', () => {
    render(createElement(SoundEditor))
    // Radix Switch renders as role="switch"
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThanOrEqual(2)
  })
})
