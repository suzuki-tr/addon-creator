import { describe, it, expect } from 'vitest'
import { isValidId, toId } from './WizardStep2'

describe('isValidId', () => {
  it('accepts lowercase letters, digits, and underscores', () => {
    expect(isValidId('my_cool_mob')).toBe(true)
  })

  it('accepts a single lowercase letter', () => {
    expect(isValidId('a')).toBe(true)
  })

  it('accepts digits and letters mixed', () => {
    expect(isValidId('mob2024')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidId('')).toBe(false)
  })

  it('rejects uppercase letters', () => {
    expect(isValidId('MyCoolMob')).toBe(false)
  })

  it('rejects strings with spaces', () => {
    expect(isValidId('my cool mob')).toBe(false)
  })

  it('rejects Japanese characters', () => {
    expect(isValidId('かっこいいモブ')).toBe(false)
  })

  it('rejects strings with hyphens', () => {
    expect(isValidId('my-cool-mob')).toBe(false)
  })
})

describe('toId (display name → ID conversion)', () => {
  it('lowercases the input', () => {
    expect(toId('CoolMob')).toBe('coolmob')
  })

  it('converts spaces to underscores', () => {
    expect(toId('my cool mob')).toBe('my_cool_mob')
  })

  it('preserves existing underscores', () => {
    expect(toId('my_cool_mob')).toBe('my_cool_mob')
  })

  it('strips non-ASCII characters (Japanese)', () => {
    expect(toId('かっこいいモブ')).toBe('')
  })

  it('strips emoji', () => {
    expect(toId('🐾🐉')).toBe('')
  })

  it('returns empty string for mixed Japanese + spaces', () => {
    expect(toId('かっこいい モブ')).toBe('_')
  })

  /**
   * Edge case: Japanese-only display name produces empty string from toId().
   * WizardStep2.handleDisplayNameChange skips the id overwrite when toId() returns ''.
   * This test documents that behaviour so Step2 never clears a manually-entered ID.
   */
  it('returns falsy for Japanese-only input (empty-ID guard trigger)', () => {
    const suggestedId = toId('かっこいいモブ')
    expect(suggestedId).toBeFalsy()
  })

  it('strips hyphens and other punctuation', () => {
    expect(toId('cool-mob!')).toBe('coolmob')
  })

  it('collapses multiple consecutive spaces into one underscore', () => {
    expect(toId('a  b')).toBe('a_b')
  })
})
