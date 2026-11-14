import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'

// Minimal stubs for plugins referenced in existing disable-comments but not installed.
// Without these stubs ESLint v9 errors with "Definition for rule was not found".
const reactStub = {
  rules: {
    'no-array-index-key': { create: () => ({}) },
  },
}
const jsxA11yStub = {
  rules: {
    'no-autofocus': { create: () => ({}) },
  },
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      react: reactStub,
      'jsx-a11y': jsxA11yStub,
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Stub rules — always off; kept here so disable-comments in source are valid
      'react/no-array-index-key': 'off',
      'jsx-a11y/no-autofocus': 'off',
    },
  },
]
