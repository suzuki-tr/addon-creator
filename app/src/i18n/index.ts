import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ja from './locales/ja.json'
import jaKids from './locales/ja-kids.json'
import en from './locales/en.json'

export const SUPPORTED_LANGUAGES = ['ja', 'ja-kids', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      // ja-kids is a strict subset of ja — missing keys fall back to ja
      'ja-kids': { translation: jaKids },
      en: { translation: en },
    },
    fallbackLng: {
      // If a key is missing in ja-kids, try ja first, then en
      'ja-kids': ['ja', 'en'],
      default: ['ja', 'en'],
    },
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
