import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// @testing-library/react auto-cleanup requires globals mode; wire it up manually.
afterEach(() => {
  cleanup()
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => ({
    mode: 'simple',
    locale: 'ja',
    setLocale: () => {},
    setMode: () => {},
  }),
}))

// Prevent actual i18next initialisation during tests
vi.mock('@/i18n', () => ({
  default: {
    changeLanguage: () => Promise.resolve(),
    language: 'ja',
  },
}))
