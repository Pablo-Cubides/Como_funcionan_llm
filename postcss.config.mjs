import tailwindPostcss from '@tailwindcss/postcss';

// Vitest sets VITEST=true in the environment. When running the dev server
// Next/Turbopack expects a string plugin name to avoid attempting to load
// optional native binaries (lightningcss) on some platforms. Use the
// functional plugin for test environment and the string name for dev/production.
const plugins = process.env.VITEST ? [tailwindPostcss] : ['@tailwindcss/postcss'];

const config = { plugins };

export default config;
