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
 *
 * Root-cause of the "subtitle does not change" bug (i18next v25 / lowerCaseLng):
 * i18next v25 formatLanguageCode() passes the language code through
 * Intl.getCanonicalLocales(), which turns 'ja-kids' → 'ja-Kids' (capital K).
 * toResolveHierarchy('ja-kids') therefore returns ['ja-Kids', 'ja', 'en'].
 * Since resources are registered under 'ja-kids' (lower-case), 'ja-Kids' has
 * no translations, so resolvedLanguage falls back to 'ja' and t() always
 * returns ja.json values regardless of the selected locale.
 * Fix: lowerCaseLng: true in i18n/index.ts normalises 'ja-Kids' → 'ja-kids'.
 */
import { describe, it, expect, vi } from 'vitest'
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

  it('ja-kids home.hero.subtitle differs from ja (most visible UI text on home screen)', async () => {
    const { default: jaKids } = await import('./locales/ja-kids.json')
    const kidsSubtitle = (((jaKids as DeepAny).home as DeepAny)?.hero as DeepAny)?.subtitle as string
    expect(kidsSubtitle).not.toBeUndefined()
    expect(kidsSubtitle).not.toBe(jaJson.home.hero.subtitle)
  })
})

/**
 * Runtime i18n language-switching tests.
 *
 * These tests use the REAL i18n instance (via vi.importActual, bypassing the
 * global mock in setup.ts) to verify that changeLanguage('ja-kids') resolves to
 * the ja-kids resources and returns the correct translated strings — the exact
 * regression guard for the bug where lowerCaseLng was missing and
 * resolvedLanguage stayed at 'ja' because toResolveHierarchy produced
 * ['ja-Kids', 'ja', 'en'] with no match for the 'ja-kids' resource key.
 */
describe('i18n runtime – changeLanguage reactivity (real instance, not mock)', () => {
  it('resolvedLanguage is ja-kids after changeLanguage(ja-kids)', async () => {
    const { default: i18n } = await vi.importActual<typeof import('./index')>('./index')
    await i18n.changeLanguage('ja-kids')
    expect(i18n.resolvedLanguage).toBe('ja-kids')
    // restore
    await i18n.changeLanguage('ja')
  })

  it('languages hierarchy starts with ja-kids (not ja-Kids) after changeLanguage', async () => {
    const { default: i18n } = await vi.importActual<typeof import('./index')>('./index')
    await i18n.changeLanguage('ja-kids')
    expect(i18n.languages[0]).toBe('ja-kids')
    await i18n.changeLanguage('ja')
  })

  it('home.hero.subtitle returns ja-kids value after changeLanguage(ja-kids)', async () => {
    const { default: i18n } = await vi.importActual<typeof import('./index')>('./index')
    await i18n.changeLanguage('ja-kids')
    expect(i18n.t('home.hero.subtitle')).toBe('じぶんだけのアドオンをつくってみましょう！ 🎮')
    await i18n.changeLanguage('ja')
  })

  it('home.hero.subtitle returns ja value after switching back to ja', async () => {
    const { default: i18n } = await vi.importActual<typeof import('./index')>('./index')
    await i18n.changeLanguage('ja-kids')
    await i18n.changeLanguage('ja')
    expect(i18n.t('home.hero.subtitle')).toBe(
      '自分だけのモブ・ブロック・アイテムを作って、マインクラフトの世界を広げよう！',
    )
  })
})
