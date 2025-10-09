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
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    env: {
      browser: true,
      node: true,
      es2024: true,
    },
    rules: {
      // Keep defaults; project can opt in to stricter rules later
    },
  },
];
