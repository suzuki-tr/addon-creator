import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { SoundEditorPage } from './SoundEditorPage'

describe('SoundEditorPage', () => {
  it('renders without crashing', () => {
    render(createElement(SoundEditorPage))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders sound editor page title', () => {
    render(createElement(SoundEditorPage))
    expect(screen.getByText('sound.pageTitle')).toBeTruthy()
  })

  it('renders files sidebar with sound_definitions.json', () => {
    render(createElement(SoundEditorPage))
    expect(screen.getByText('sound_definitions.json')).toBeTruthy()
  })
})
