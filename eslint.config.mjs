// Minimal ESLint flat config (ESM) that avoids using FlatCompat.
// The previous config used FlatCompat and caused runtime errors in some
// Node/npm environments ("n.findConfigFile is not a function"). This file
// provides a small, safe config that ignores build/output folders and
// enables basic JS/TS parsing.

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
      parser: '@typescript-eslint/parser',
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    env: {
      browser: true,
      node: true,
      es2024: true,
    },
    // Declare common test globals to avoid `no-undef` on Vitest/Jest-style tests
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      vi: 'readonly',
    },
    rules: {
      // Keep defaults; project can opt in to stricter rules later
    },
  },
  // Provide an override specifically for test files (if you prefer stricter/looser rules there)
  {
    files: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
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
];
