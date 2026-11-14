import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'
import type { SupportedLanguage } from '@/i18n'

export type UIMode = 'simple' | 'advanced'
export type SupportedLocale = SupportedLanguage

interface UIStoreState {
  locale: SupportedLocale
  mode: UIMode
  setLocale: (locale: SupportedLocale) => void
  setMode: (mode: UIMode) => void
}

export const useUiStore = create<UIStoreState>()(
  persist(
    (set) => ({
      locale: 'ja',
      mode: 'simple',

      setLocale: (locale: SupportedLocale): void => {
        void i18n.changeLanguage(locale)
        set({ locale })
      },

      setMode: (mode: UIMode): void => {
        set({ mode })
      },
    }),
    {
      name: 'ui-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.locale)
        }
      },
    },
  ),
)
