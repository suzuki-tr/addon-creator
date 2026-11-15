/**
 * i18n locale-resource tests.
 *
 * Root-cause of the "language switching appears broken" bug (Pattern C):
 * ja-kids.json had the same value as ja.json for the most visible UI areas
 * (app.name in the header, editor.jsonPreview.* in the JSON panel).  Users
 * switching locale saw no visible change and concluded switching was broken.
 *
 * These tests assert that key high-visibility strings ARE distinct between
 * the two locales, making any regression detectable immediately.
 */
import { describe, it, expect } from 'vitest'
import jaJson from './locales/ja.json'

type DeepAny = Record<string, unknown>

describe('i18n locale resources – ja vs ja-kids visible differences', () => {
  it('ja-kids app.name differs from ja (header is immediately visible)', async () => {
    const { default: jaKids } = await import('./locales/ja-kids.json')
    const kidsName = ((jaKids as DeepAny).app as DeepAny)?.name as string
    expect(kidsName).not.toBeUndefined()
    expect(kidsName).not.toBe(jaJson.app.name)
  })

  it('ja-kids editor.jsonPreview.title differs from ja (JSON panel always shown in advanced mode)', async () => {
    const { default: jaKids } = await import('./locales/ja-kids.json')
    const kidsTitle = (((jaKids as DeepAny).editor as DeepAny)?.jsonPreview as DeepAny)?.title as string
    expect(kidsTitle).not.toBeUndefined()
    expect(kidsTitle).not.toBe(jaJson.editor.jsonPreview.title)
  })

  it('ja-kids editor.validation.title differs from ja', async () => {
    const { default: jaKids } = await import('./locales/ja-kids.json')
    const kidsTitle = (((jaKids as DeepAny).editor as DeepAny)?.validation as DeepAny)?.title as string
    expect(kidsTitle).not.toBeUndefined()
    expect(kidsTitle).not.toBe(jaJson.editor.validation.title)
  })

  it('ja-kids common.button.save differs from ja (buttons are always visible)', async () => {
    const { default: jaKids } = await import('./locales/ja-kids.json')
    const kidsSave = (((jaKids as DeepAny).common as DeepAny)?.button as DeepAny)?.save as string
    expect(kidsSave).not.toBeUndefined()
    expect(kidsSave).not.toBe(jaJson.common.button.save)
  })
})
