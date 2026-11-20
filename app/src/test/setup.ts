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
  // initReactI18next must be exported so that i18n/index.ts can call i18n.use(initReactI18next).
  // When the real i18n module is loaded via vi.importActual (runtime tests in i18n.spec.ts),
  // this no-op plugin satisfies the .use() call without requiring a full React context.
  initReactI18next: {
    type: '3rdParty' as const,
    init: (): void => {},
  },
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
