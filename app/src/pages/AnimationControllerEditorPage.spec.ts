import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { AnimationControllerEditorPage } from './AnimationControllerEditorPage'

describe('AnimationControllerEditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(AnimationControllerEditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders animation controller page title', () => {
    render(createElement(AnimationControllerEditorPage))
    expect(screen.getByText('animationController.pageTitle')).toBeTruthy()
  })

  it('renders files sidebar', () => {
    render(createElement(AnimationControllerEditorPage))
    expect(screen.getByText('animation_controller.json')).toBeTruthy()
  })
})
