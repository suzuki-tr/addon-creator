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
    // lowerCaseLng: true is required to prevent i18next v25 from canonicalizing
    // 'ja-kids' via Intl.getCanonicalLocales() to 'ja-Kids' (capital K).
    // Without this, toResolveHierarchy('ja-kids') returns ['ja-Kids', 'ja', 'en'],
    // 'ja-Kids' does not match the registered resource key 'ja-kids', so
    // resolvedLanguage falls back to 'ja' and all t() calls return ja.json values.
    lowerCaseLng: true,
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
