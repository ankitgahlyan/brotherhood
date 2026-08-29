import js from '@eslint/js';
import globals from 'globals';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.wrangler/**',
      '**/.tanstack/**',
      '**/.acton/**',
      'scripts/**',
      'public/**',
      'contracts/**',
      'wrappers/**',
      'wrappers-ts/**',
      'gen/**',
      '**/routeTree.gen.ts',
      '**/*.gen.ts',
      '**/e2e/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-compiler': reactCompiler,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactCompiler.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
