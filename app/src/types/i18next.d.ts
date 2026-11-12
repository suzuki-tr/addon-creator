// Type-safe translation keys using ja.json as the source of truth.
// ja-kids is a strict subset of ja, so ja alone is sufficient for type definitions.
// i18next's fallbackLng ensures missing ja-kids keys fall back to ja automatically.
import type ja from '../i18n/locales/ja.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof ja
    }
  }
}
