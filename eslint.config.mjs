import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import reactNativePlugin from 'eslint-plugin-react-native';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  ...compat.extends('expo', 'plugin:@typescript-eslint/recommended', 'prettier'),

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-native': reactNativePlugin,
    },

    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',

      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',

      //  Expected severity of "off", 0, "warn", 1, "error", or 2.
      'react-hooks/exhaustive-deps': 'off',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
