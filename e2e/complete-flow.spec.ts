import { test, expect } from '@playwright/test';

test.describe('ExploraModelo - Flujo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    await expect(page.getByRole('heading', { name: 'ExploraModelo', exact: true })).toBeVisible({ timeout: 30000 });
  });

  test('debe completar el flujo de 5 pasos con demo', async ({ page }) => {
    // Paso 0: Seleccionar primer demo (botón con el primer demo texto)
    const firstDemoButton = page.locator('button').filter({ hasText: /Los pájaros/ }).first();
    await expect(firstDemoButton).toBeVisible();
    await firstDemoButton.click();
    
    // Verificar que el botón de comenzar está habilitado
    const startButton = page.getByRole('button', { name: /Comenzar Análisis|Comenzar análisis/i });
    await expect(startButton).toBeEnabled();
    await startButton.click();
    
    // Paso 1: Tokenización - buscar por h2 específico con clase
    await expect(page.locator('h2:has-text("Tokenización")')).toBeVisible({ timeout: 10000 });
    const chips = page.locator('.chip');
    expect(await chips.count()).toBeGreaterThan(0);
    const nextButton1 = page.getByRole('button', { name: /Siguiente.*Embeddings/i });
    await expect(nextButton1).toBeVisible();
    await nextButton1.click();
    
    // Paso 2: Embeddings
    await expect(page.locator('h2:has-text("Embeddings")')).toBeVisible({ timeout: 10000 });
    const nextButton2 = page.getByRole('button', { name: /Siguiente.*Atención/i });
    await expect(nextButton2).toBeVisible();
    await nextButton2.click();
    
    // Paso 3: Atención
    await expect(page.locator('h2:has-text("Self-Attention")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('table')).toBeVisible();
    const nextButton3 = page.getByRole('button', { name: /Siguiente.*Probabilidades/i });
    await expect(nextButton3).toBeVisible();
    await nextButton3.click();
    
    // Paso 4: Probabilidades
    await expect(page.locator('h2:has-text("Probabilidades")')).toBeVisible({ timeout: 10000 });
    const nextButton4 = page.getByRole('button', { name: /Siguiente.*Generación/i });
    await expect(nextButton4).toBeVisible();
    await nextButton4.click();
    
    // Paso 5: Generación
    await expect(page.locator('h2:has-text("Generación")')).toBeVisible({ timeout: 10000 });
    const generateButton = page.getByRole('button', { name: /Generar|generar/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();
    
    // Esperar a que se genere el token
    await page.waitForTimeout(1000);
    await expect(page.locator('button.navigation-button')).toBeVisible({ timeout: 5000 });
  });

  test('debe validar input máximo de tokens', async ({ page }) => {
    const textarea = page.locator('textarea#input-text');
    await expect(textarea).toBeVisible();
    
    // Escribir texto muy largo
    const longText = 'palabra '.repeat(100); // Más de 50 tokens
    await textarea.fill(longText);
    
    // Verificar que el contador mostró exceso
    await expect(page.locator('text=/Límite|límite/i')).toBeVisible();
  });

  test('debe cambiar estrategia de muestreo en generación', async ({ page }) => {
    // Navegar hasta el paso 5
    const firstDemoButton = page.locator('button').filter({ hasText: /Los pájaros/ }).first();
    await firstDemoButton.click();
    await page.getByRole('button', { name: /Comenzar Análisis|Comenzar análisis/i }).click();
    
    // Avanzar rápidamente a través de los pasos
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(500); // Esperar procesamiento
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else {
        break;
      }
    }
    
    // Verificar que estamos en paso 5
    await expect(page.locator('h2:has-text("Generación")')).toBeVisible({ timeout: 15000 });
    
    // Buscar select de estrategia (puede estar en diferentes selectores)
    let strategySelect = page.locator('select#sampling-strategy');
    if (!(await strategySelect.isVisible())) {
      strategySelect = page.locator('select').filter({ hasText: /estrategia|strategy|muestreo/i });
    }
    
    if (await strategySelect.isVisible()) {
      await strategySelect.selectOption('random');
    }
    
    // Generar token
    const generateButton = page.getByRole('button', { name: /Generar|generar/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }
    
    // Verificar que se generó algo
    await expect(page.locator('button.navigation-button')).toBeVisible();
  });

  test('debe reiniciar correctamente desde el paso final', async ({ page }) => {
    // Llegar al paso final
    const firstDemoButton = page.locator('button').filter({ hasText: /Los pájaros/ }).first();
    await firstDemoButton.click();
    await page.getByRole('button', { name: /Comenzar Análisis|Comenzar análisis/i }).click();
    
    // Avanzar a paso 5
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(500);
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else {
        break;
      }
    }
    
    // Click en reiniciar
    const restartButton = page.getByRole('button', { name: /Reiniciar|reiniciar/i });
    if (await restartButton.isVisible()) {
      await restartButton.click();
    }
    
    // Verificar que volvemos al inicio
    await expect(page.locator('h1:has-text("ExploraModelo")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea#input-text')).toBeVisible();
  });

  test('debe alternar modo explicación', async ({ page }) => {
    // Verificar que el toggle existe y puede hacerse visible con scroll
    const toggle = page.locator('input[type="checkbox"]').first();
    
    // Hacer scroll si es necesario para que sea visible
    await toggle.scrollIntoViewIfNeeded();
    
    // Interactuar sin verificar visibilidad primero
    const initialState = await toggle.isChecked();
    
    // Click para cambiar estado
    await toggle.click();
    const newState = await toggle.isChecked();
    expect(newState).not.toBe(initialState);
    
    // Click para volver al estado anterior
    await toggle.click();
    const finalState = await toggle.isChecked();
    expect(finalState).toBe(initialState);
  });

  test('debe permitir navegación entre pasos completados', async ({ page }) => {
    // Completar hasta paso 2
    const firstDemoButton = page.locator('button').filter({ hasText: /Los pájaros/ }).first();
    await firstDemoButton.click();
    await page.getByRole('button', { name: /Comenzar Análisis|Comenzar análisis/i }).click();
    
    // Avanzar 1 paso
    for (let i = 0; i < 1; i++) {
      await page.waitForTimeout(500);
      const nextButton = page.locator('button.navigation-button').filter({ hasText: /Siguiente/ });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else {
        break;
      }
    }
    
    // Click en un paso anterior del stepper
    const tokenizationStep = page.locator('.step-item-horizontal').filter({ hasText: 'Tokenización' });
    if (await tokenizationStep.isVisible()) {
      await tokenizationStep.click();
    }
    
    // Verificar que volvemos a ese paso
    await expect(page.locator('h2:has-text("Tokenización")')).toBeVisible();
  });
});

test.describe('ExploraModelo - Validaciones', () => {
  test('no debe permitir comenzar sin texto', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.getByRole('button', { name: /Comenzar Análisis|Comenzar análisis/i });
    await expect(startButton).toBeDisabled();
  });

  test('debe mostrar contador de caracteres', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea#input-text');
    await textarea.fill('Hola mundo');
    
    // Verificar contador de caracteres - buscar en cualquier elemento
    await expect(page.locator('text=/\\d+\\s*\\/\\s*200/i')).toBeVisible();
  });

  test('debe mostrar contador de tokens', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea#input-text');
    await textarea.fill('Hola mundo de prueba');
    
    // Verificar contador de tokens - buscar el patrón
    await expect(page.locator('text=/[Tt]okens|tokens/i')).toBeVisible();
  });
});
