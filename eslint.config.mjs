// Minimal ESLint flat config (ESM) that avoids using FlatCompat.
// The previous config used FlatCompat and caused runtime errors in some
// Node/npm environments ("n.findConfigFile is not a function"). This file
// provides a small, safe config that ignores build/output folders and
// enables basic JS/TS parsing.

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // Ignore common build and dependency folders
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Basic language and environment settings so ESLint can run safely
  {
    languageOptions: {
      // Use the TypeScript parser so .ts/.tsx files are parsed correctly
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        // `project` is intentionally omitted here to avoid parser errors
        // on JS/MJS config files that are not part of tsconfig.json.
      },
      // Define common globals explicitly (flat config does not support `env`)
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        // Node
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        // Common
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // ES globals
        BigInt: 'readonly',
        globalThis: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Incrementally stricter rules: start with warnings so we can fix issues
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  '@typescript-eslint/no-explicit-any': ['error'],
      '@typescript-eslint/no-empty-function': ['warn'],
      'no-unused-vars': 'off', // rely on TS rule
    },
  },
  // Provide an override specifically for test files (if you prefer stricter/looser rules there)
  {
    files: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // For test files we don't need full type-aware linting; keep empty
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
  // Enable type-aware parsing only for TypeScript source files under src/
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
  },
];
