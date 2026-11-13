import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { JsonPreviewPanel } from './JsonPreviewPanel'

describe('JsonPreviewPanel', () => {
  it('renders without crashing', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'my_mob' }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders JSON preview title', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'my_mob' }))
    expect(screen.getByText('editor.jsonPreview.title')).toBeTruthy()
  })

  it('renders copy button', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'my_mob' }))
    const copyBtn = screen.getByRole('button', { name: 'editor.jsonPreview.copyButton' })
    expect(copyBtn).toBeTruthy()
  })

  it('renders validation section', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'my_mob' }))
    expect(screen.getByText('editor.validation.title')).toBeTruthy()
  })

  it('renders 3D preview section', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'my_mob' }))
    expect(screen.getByText('editor.preview3d.title')).toBeTruthy()
  })

  it('renders expected preview3d camera reset button', () => {
    render(createElement(JsonPreviewPanel, { entityName: 'test_entity' }))
    const resetBtn = screen.getByRole('button', { name: 'editor.preview3d.cameraReset' })
    expect(resetBtn).toBeTruthy()
  })
})
