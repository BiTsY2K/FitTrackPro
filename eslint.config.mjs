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
  { ignores: ['dist/*', 'node_modules/*', 'functions/lib/*', '.expo/*'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  ...compat.extends('expo', 'plugin:@typescript-eslint/recommended', 'prettier'),

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-native': reactNativePlugin,
    },

    files: ['**/*.{ts,tsx}'],
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',

      'react-native/no-unused-styles': 'warn',
      // 'react-native/no-inline-styles': 'warn',

      //  Expected severity of "off", 0, "warn", 1, "error", or 2.
      'react-hooks/exhaustive-deps': 'off',

      // Features must not import from sibling features directly.
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/auth',
              from: './src/features',
              except: ['./auth'],
            },
            {
              target: './src/features/onboarding',
              from: './src/features',
              except: ['./onboarding'],
            },
            {
              target: './src/features/food-logging',
              from: './src/features',
              except: ['./food-logging'],
            },
          ],
        },
      ],
    },
  },

  // Cloud Functions is a separate package with its own tsconfig/node_modules.
  // Point the import resolver at it so subpath exports (e.g. `firebase-functions/v2`) resolve.
  {
    files: ['functions/**/*.ts'],
    settings: {
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'functions/tsconfig.json'),
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },
];
