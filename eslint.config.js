import js from '@eslint/js'
import node from 'eslint-plugin-node'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      node, // Add the Node plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add node plugin's recommended rules if needed:
      'node/no-unsupported-features/es-syntax': 'error', // Checks for unsupported ECMAScript syntax in Node.js
      'node/no-extraneous-import': 'error', // Ensures correct module imports in Node.js

      // React PropTypes validation (optional, if you're using PropTypes)
      'react/prop-types': ['warn'], // Enables PropTypes validation in React components
    },
  },
]
