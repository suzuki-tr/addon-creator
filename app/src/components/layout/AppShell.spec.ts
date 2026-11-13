import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders without crashing', () => {
    render(createElement(AppShell, { children: 'test content' }))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders children content', () => {
    render(createElement(AppShell, { children: 'test content' }))
    expect(screen.getByText('test content')).toBeTruthy()
  })

  it('renders header with app name', () => {
    render(createElement(AppShell, { children: 'content' }))
    expect(screen.getByText('app.name')).toBeTruthy()
  })

  it('renders with noPadding flag', () => {
    render(createElement(AppShell, { noPadding: true, children: 'padded content' }))
    expect(screen.getByText('padded content')).toBeTruthy()
  })
})
