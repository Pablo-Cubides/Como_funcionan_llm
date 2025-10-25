import { test, expect } from '@playwright/test';

test.describe('ExploraModelo - Flujo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    await expect(page.getByRole('heading', { name: /ExploraModelo/i })).toBeVisible({ timeout: 30000 });
  });

  test('debe completar el flujo de 5 pasos con demo', async ({ page }) => {
    // Paso 0: Seleccionar primer demo
    const demoSelect = page.locator('select#demo-select');
    await expect(demoSelect).toBeVisible();
    await demoSelect.selectOption({ index: 1 });
    
    // Verificar que el botón de comenzar está habilitado
    const startButton = page.getByRole('button', { name: /Comenzar Análisis/i });
    await expect(startButton).toBeEnabled();
    await startButton.click();
    
    // Paso 1: Tokenización
    await expect(page.locator('h2', { hasText: 'Tokenización' })).toBeVisible({ timeout: 10000 });
    const chips = page.locator('.chip');
    expect(await chips.count()).toBeGreaterThan(0);
    const nextButton1 = page.getByRole('button', { name: /Siguiente: Embeddings/i });
    await expect(nextButton1).toBeVisible();
    await nextButton1.click();
    
    // Paso 2: Embeddings
    await expect(page.locator('h2', { hasText: 'Embeddings' })).toBeVisible({ timeout: 10000 });
    const nextButton2 = page.getByRole('button', { name: /Siguiente.*Atención/i });
    await expect(nextButton2).toBeVisible();
    await nextButton2.click();
    
    // Paso 3: Atención
    await expect(page.locator('h2', { hasText: 'Atención' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('table')).toBeVisible();
    const nextButton3 = page.getByRole('button', { name: /Siguiente.*Probabilidades/i });
    await expect(nextButton3).toBeVisible();
    await nextButton3.click();
    
    // Paso 4: Probabilidades
    await expect(page.locator('h2', { hasText: 'Probabilidades' })).toBeVisible({ timeout: 10000 });
    const nextButton4 = page.getByRole('button', { name: /Siguiente.*Generación/i });
    await expect(nextButton4).toBeVisible();
    await nextButton4.click();
    
    // Paso 5: Generación
    await expect(page.locator('h2', { hasText: 'Generación' })).toBeVisible({ timeout: 10000 });
    const generateButton = page.getByRole('button', { name: /Generar Siguiente Token/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();
    
    // Esperar a que se genere el token
    await expect(page.locator('.px-4.py-2.bg-gradient-to-r.from-emerald-500')).toBeVisible({ timeout: 5000 });
  });

  test('debe validar input máximo de tokens', async ({ page }) => {
    const textarea = page.locator('textarea#input-text');
    await expect(textarea).toBeVisible();
    
    // Escribir texto muy largo
    const longText = 'palabra '.repeat(100); // Más de 50 tokens
    await textarea.fill(longText);
    
    // El botón debe estar deshabilitado
    const startButton = page.getByRole('button', { name: /Comenzar Análisis/i });
    await expect(startButton).toBeDisabled();
    
    // Verificar mensaje de error
    await expect(page.locator('text=Límite de tokens superado')).toBeVisible();
  });

  test('debe cambiar estrategia de muestreo en generación', async ({ page }) => {
    // Navegar hasta el paso 5
    const demoSelect = page.locator('select#demo-select');
    await demoSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: /Comenzar Análisis/i }).click();
    
    // Avanzar rápidamente a través de los pasos
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(1000); // Esperar procesamiento
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
    
    // Verificar que estamos en paso 5
    await expect(page.locator('h2', { hasText: 'Generación' })).toBeVisible({ timeout: 15000 });
    
    // Cambiar estrategia a random
    const strategySelect = page.locator('select#sampling-strategy');
    await expect(strategySelect).toBeVisible();
    await strategySelect.selectOption('random');
    
    // Generar token
    await page.getByRole('button', { name: /Generar Siguiente Token/i }).click();
    await page.waitForTimeout(1000);
    
    // Verificar que se generó
    await expect(page.locator('.px-4.py-2.bg-gradient-to-r.from-emerald-500')).toBeVisible();
  });

  test('debe reiniciar correctamente desde el paso final', async ({ page }) => {
    // Llegar al paso final
    const demoSelect = page.locator('select#demo-select');
    await demoSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: /Comenzar Análisis/i }).click();
    
    // Avanzar a paso 5
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(1000);
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
    
    // Click en reiniciar
    const restartButton = page.getByRole('button', { name: /Reiniciar/i });
    await expect(restartButton).toBeVisible();
    await restartButton.click();
    
    // Verificar que volvemos al inicio
    await expect(page.locator('h1', { hasText: 'ExploraModelo' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea#input-text')).toBeVisible();
  });

  test('debe alternar modo explicación', async ({ page }) => {
    // Verificar que el toggle existe
    const toggle = page.locator('input[type="checkbox"]');
    await expect(toggle).toBeVisible();
    
    // Verificar estado inicial (activado por defecto)
    await expect(toggle).toBeChecked();
    
    // Desactivar
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    
    // Reactivar
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('debe permitir navegación entre pasos completados', async ({ page }) => {
    // Completar hasta paso 3
    const demoSelect = page.locator('select#demo-select');
    await demoSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: /Comenzar Análisis/i }).click();
    
    // Avanzar 2 pasos
    for (let i = 0; i < 2; i++) {
      await page.waitForTimeout(1000);
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
    
    // Click en un paso anterior del stepper
    const tokenizationStep = page.locator('.step-item').filter({ hasText: 'Tokenización' });
    await expect(tokenizationStep).toBeVisible();
    await tokenizationStep.click();
    
    // Verificar que volvemos a ese paso
    await expect(page.locator('h2', { hasText: 'Tokenización' })).toBeVisible();
  });
});

test.describe('ExploraModelo - Validaciones', () => {
  test('no debe permitir comenzar sin texto', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.getByRole('button', { name: /Comenzar Análisis/i });
    await expect(startButton).toBeDisabled();
  });

  test('debe mostrar contador de caracteres', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea#input-text');
    await textarea.fill('Hola mundo');
    
    // Verificar contador de caracteres
    await expect(page.locator('text=/\\d+ \\/ 200/')).toBeVisible();
  });

  test('debe mostrar contador de tokens', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea#input-text');
    await textarea.fill('Hola mundo de prueba');
    
    // Verificar contador de tokens
    await expect(page.locator('text=/Tokens: \\d+ \\/ \\d+/')).toBeVisible();
  });
});
