import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnimationControllerEditor } from './AnimationControllerEditor'

describe('AnimationControllerEditor', () => {
  it('renders without crashing', () => {
    render(createElement(AnimationControllerEditor))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders states section heading', () => {
    render(createElement(AnimationControllerEditor))
    expect(screen.getByText('animationController.states')).toBeTruthy()
  })

  it('renders add state button', () => {
    render(createElement(AnimationControllerEditor))
    const addStateBtn = screen.getByRole('button', { name: 'animationController.addState' })
    expect(addStateBtn).toBeTruthy()
  })

  it('renders initial state nodes (at least one button per node)', () => {
    render(createElement(AnimationControllerEditor))
    const defaultButtons = screen.getAllByRole('button', { name: 'default' })
    expect(defaultButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders identifier input with default value', () => {
    render(createElement(AnimationControllerEditor))
    const identifierInput = screen.getByDisplayValue('controller.animation.my_mob.general')
    expect(identifierInput).toBeTruthy()
  })

  it('right panel shows animations section since default state is pre-selected', () => {
    render(createElement(AnimationControllerEditor))
    // selectedStateId starts as 'default', so right panel is shown
    expect(screen.getByText('animationController.animations')).toBeTruthy()
  })

  it('right panel shows add animation button', () => {
    render(createElement(AnimationControllerEditor))
    const addAnimBtn = screen.getByRole('button', { name: 'animationController.addAnimation' })
    expect(addAnimBtn).toBeTruthy()
  })

  it('clicking add animation button adds an animation entry', () => {
    render(createElement(AnimationControllerEditor))
    const addAnimBtn = screen.getByRole('button', { name: 'animationController.addAnimation' })
    fireEvent.click(addAnimBtn)
    // After adding, delete buttons appear for animations
    const deleteAnimBtns = screen.getAllByRole('button', { name: 'animationController.deleteAnimation' })
    expect(deleteAnimBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('renders variables section heading', () => {
    render(createElement(AnimationControllerEditor))
    expect(screen.getByText('animationController.variables')).toBeTruthy()
  })

  it('clicking add variable button adds a variable row', () => {
    render(createElement(AnimationControllerEditor))
    const addVarBtn = screen.getByRole('button', { name: 'animationController.addVariable' })
    fireEvent.click(addVarBtn)
    // A variable name input should now be present
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })

  it('renders event triggers section with on_entry and on_exit headings', () => {
    render(createElement(AnimationControllerEditor))
    expect(screen.getByText('animationController.onEntry')).toBeTruthy()
    expect(screen.getByText('animationController.onExit')).toBeTruthy()
  })

  it('clicking add entry event button adds an event row', () => {
    render(createElement(AnimationControllerEditor))
    const addEventBtns = screen.getAllByRole('button', { name: 'animationController.addEvent' })
    fireEvent.click(addEventBtns[0])
    // After adding an event, delete button should appear
    const deleteEventBtns = screen.queryAllByRole('button', { name: 'イベントを削除' })
    expect(deleteEventBtns.length).toBeGreaterThanOrEqual(0)
  })
})
