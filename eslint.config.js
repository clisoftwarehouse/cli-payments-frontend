import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tanstack from '@tanstack/eslint-plugin-query';
import reactRefresh from 'eslint-plugin-react-refresh';
import perfectionist from 'eslint-plugin-perfectionist';
import typescriptParser from '@typescript-eslint/parser';

const eslintConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    },
  },
  {
    files: ['**/*.{ts,tsx}', '**/*.ts/*.js'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: { perfectionist, prettier, 'react-hooks': reactHooks, 'react-refresh': reactRefresh, tanstack },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'perfectionist/sort-named-imports': [
        1,
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-named-exports': [
        1,
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-exports': [
        1,
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-imports': [
        1,
        {
          order: 'asc',
          type: 'line-length',
          newlinesBetween: 1,
          groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index'], 'unknown'],
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', '.github', 'types.generated.d.ts'],
  },
];

export default eslintConfig;
