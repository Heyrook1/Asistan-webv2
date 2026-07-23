import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

/** Node / browser globals used across App Router + scripts (no `globals` pkg). */
const sharedGlobals = {
  Blob: 'readonly',
  Buffer: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  document: 'readonly',
  File: 'readonly',
  FormData: 'readonly',
  navigator: 'readonly',
  process: 'readonly',
  React: 'readonly',
  RequestInit: 'readonly',
  setTimeout: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  window: 'readonly',
}

const nodeScriptGlobals = {
  ...sharedGlobals,
  __dirname: 'readonly',
  __filename: 'readonly',
  exports: 'writable',
  module: 'writable',
  require: 'readonly',
  global: 'readonly',
  fetch: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  AbortController: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
}

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'supabase/**',
      // Ops / CDP / migration scripts — Node tooling, not app surface
      'scripts/**',
      // Expo app — linted separately; CommonJS + require() asset patterns break root ESLint
      'mobile/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: sharedGlobals,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: nodeScriptGlobals,
      sourceType: 'module',
    },
    rules: {
      // From typescript-eslint disableTypeChecked — avoid projectService on plain JS
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
