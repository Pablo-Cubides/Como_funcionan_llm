import { test, expect } from '@playwright/test';

test('smoke: run through stepper from input to tokenization', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for the main header to ensure page loaded (allow Next compilation time)
  await expect(page.getByRole('heading', { name: 'ExploraModelo', exact: true })).toBeVisible({ timeout: 30000 });

  // Click the first demo button by CSS (grid) - more robust
  const firstDemo = page.locator('.grid button').first();
  await expect(firstDemo).toBeVisible({ timeout: 5000 });
  await firstDemo.click();

  // Click start analysis (look for button with partial text)
  const startButton = page.getByRole('button', { name: /Comenzar análisis/i }).first();
  await expect(startButton).toBeVisible();
  await startButton.click();

  // After starting, the tokenization step should render
  const tokenHeading = page.locator('h2', { hasText: 'Tokenización' });
  await expect(tokenHeading).toBeVisible({ timeout: 10000 });
});
