import { test, expect } from '@playwright/test';

test('smoke: run through stepper from input to tokenization', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for the main header to ensure page loaded (allow Next compilation time)
  await expect(page.getByRole('heading', { name: 'ExploraModelo', exact: true })).toBeVisible({ timeout: 30000 });

  // Click the first demo button - try multiple selectors
  let firstDemo = page.locator('button').filter({ hasText: /Los pájaros|inteligencia|resúmenes|cien grados/ }).first();
  
  if (!(await firstDemo.isVisible())) {
    // Fallback: click on any button with demo text
    firstDemo = page.locator('button').first();
  }
  
  await expect(firstDemo).toBeVisible({ timeout: 5000 });
  await firstDemo.click();

  // Click start analysis (look for button with partial text)
  const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i }).first();
  await expect(startButton).toBeVisible();
  await startButton.click();

  // After starting, the tokenization step should render
  const tokenHeading = page.locator('h2:has-text("Tokenización")');
  await expect(tokenHeading).toBeVisible({ timeout: 10000 });
});
