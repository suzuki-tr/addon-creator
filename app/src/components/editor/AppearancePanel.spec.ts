import { describe, it, expect, beforeEach } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppearancePanel } from './AppearancePanel'
import { useProjectStore } from '@/stores/projectStore'

/** Minimal valid project to populate the store */
const MINIMAL_PROJECT = {
  entityId: 'test_entity',
  entityDisplayName: 'Test Entity',
  contentType: 'mob' as const,
  baseType: 'scratch' as const,
  selectedVanillaId: null,
  selectedTraits: [],
  status: { health: 20, attackDamage: 3, movementSpeed: 0.25, scale: 1.0 },
  manifestUuid: 'uuid-m',
  moduleUuid: 'uuid-mo',
  rpManifestUuid: 'uuid-rp',
  rpModuleUuid: 'uuid-rpo',
}

describe('AppearancePanel', () => {
  // Reset project store before each test so tests are isolated
  beforeEach(() => {
    useProjectStore.getState().clearProject()
  })

  it('renders without crashing', () => {
    render(createElement(AppearancePanel))
    expect(document.body.firstChild).toBeTruthy()
  })

  it('renders geometry tab selected by default', () => {
    render(createElement(AppearancePanel))
    // Tab keys: editor.appearance.tabs.geometry / editor.appearance.tabs.texture
    const geometryTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.geometry' })
    expect(geometryTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders texture tab button', () => {
    render(createElement(AppearancePanel))
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    expect(textureTab).toBeTruthy()
  })

  it('material tab is not shown in simple mode', () => {
    render(createElement(AppearancePanel))
    // mode='simple' in mock — material tab is advanced-only
    expect(screen.queryByRole('tab', { name: 'editor.appearance.tabs.material' })).toBeNull()
  })

  it('switching to texture tab selects it', () => {
    render(createElement(AppearancePanel))
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    fireEvent.click(textureTab)
    expect(textureTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders 3D preview canvas in geometry pane', () => {
    render(createElement(AppearancePanel))
    // BabylonPreview renders a <canvas> element for the 3D viewport
    expect(document.querySelector('canvas')).toBeTruthy()
  })

  // ---------------------------------------------------------------------------
  // Texture upload — thumbnail display (fix: localTextureDataUrl fallback)
  // ---------------------------------------------------------------------------
  it('thumbnail shows uploaded texture when project is set (normal flow)', async () => {
    // Normal flow: project is set via wizard before entering editor
    useProjectStore.getState().setProject(MINIMAL_PROJECT)

    render(createElement(AppearancePanel))

    // Navigate to texture sub-tab
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    fireEvent.click(textureTab)

    // No thumbnail img before upload
    expect(screen.queryByRole('img')).toBeNull()

    // Simulate file selection
    const fileInput = screen.getByTestId('texture-file-input')
    const file = new File(['fake-png-bytes'], 'my_texture.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    // After FileReader completes, thumbnail <img> should appear with a data: URL
    await waitFor(() => {
      const img = screen.queryByRole('img')
      expect(img).not.toBeNull()
      expect(img?.getAttribute('src')).toMatch(/^data:/)
    })

    // Also verify the project store captured the texture
    expect(useProjectStore.getState().project?.texture?.dataUrl).toMatch(/^data:/)
  })

  it('thumbnail shows uploaded texture even when project is null (page-refresh edge case)', async () => {
    // Edge case: project is null (e.g. page refresh loses Zustand state).
    // updateTexture() is a no-op in this scenario, but localTextureDataUrl
    // in AppearancePanel should still drive the thumbnail via effectiveTextureDataUrl.
    // project remains null in the store, confirming that the fix is local-state based.

    render(createElement(AppearancePanel))

    // Navigate to texture sub-tab
    const textureTab = screen.getByRole('tab', { name: 'editor.appearance.tabs.texture' })
    fireEvent.click(textureTab)

    // No thumbnail img before upload
    expect(screen.queryByRole('img')).toBeNull()

    // Simulate file selection (project is null → updateTexture is a no-op)
    const fileInput = screen.getByTestId('texture-file-input')
    const file = new File(['fake-png-bytes'], 'my_texture.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Thumbnail should still appear via AppearancePanel's local state fallback
    await waitFor(() => {
      const img = screen.queryByRole('img')
      expect(img).not.toBeNull()
      expect(img?.getAttribute('src')).toMatch(/^data:/)
    })

    // Confirm store was NOT updated (project is still null)
    expect(useProjectStore.getState().project).toBeNull()
  })
})
