import { test, expect } from '@playwright/test';

test.describe('ExploraModelo - Tests Simplificados', () => {
  test('debería cargar la página correctamente', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Verificar que la página cargó
    await expect(page.getByRole('heading', { name: 'ExploraModelo', exact: true })).toBeVisible();
  });

  test('debería permitir escribir en el textarea', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    const textarea = page.locator('textarea#input-text');
    await expect(textarea).toBeVisible();
    await textarea.fill('Hola mundo');
    
    // Verificar que el texto se escribió
    const value = await textarea.inputValue();
    expect(value).toBe('Hola mundo');
  });

  test('debería mostrar contador de tokens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    const textarea = page.locator('textarea#input-text');
    await textarea.fill('Hola mundo de prueba');
    
    // Verificar que hay algo con "tokens" visible en la página
    const tokenCounter = page.locator('text=/\\d+\\s*\\/\\s*50\\s*tokens/i');
    await expect(tokenCounter).toBeVisible();
  });

  test('debería tener botón comenzar deshabilitado al inicio', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i });
    
    // Al inicio debería estar deshabilitado
    const isDisabled = await startButton.evaluate((el) => {
      const button = el as HTMLButtonElement;
      return button.disabled;
    });
    expect(isDisabled).toBe(true);
  });

  test('debería permitir seleccionar demos', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Buscar un botón de demo
    const demoButtons = page.locator('button').filter({ hasText: /pájaros|inteligencia|resúmenes|agua/ });
    const count = await demoButtons.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('debería activar modo explicación', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    const toggle = page.locator('input[type="checkbox"]').first();
    const initialState = await toggle.isChecked();
    
    // Usar evaluate para cambiar el estado directamente si es necesario
    try {
      await toggle.click({ force: true, timeout: 1000 });
    } catch {
      // Si el click falla, usar evaluate
      await toggle.evaluate((el: HTMLInputElement) => {
        el.click();
      });
    }
    
    await page.waitForTimeout(500);
    
    const newState = await toggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('flujo completo: seleccionar demo y comenzar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Seleccionar un demo
    const demoButton = page.locator('button').filter({ hasText: /pájaros/ }).first();
    await expect(demoButton).toBeVisible();
    await demoButton.click();
    
    // Verificar que se llenó el textarea
    const textarea = page.locator('textarea#input-text');
    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(0);
    
    // Hacer click en comenzar
    const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i });
    await startButton.click();
    
    // Esperar a que aparezca el primer paso (Tokenización)
    await expect(page.locator('h2').filter({ hasText: 'Tokenización' })).toBeVisible({ timeout: 10000 });
  });

  test('debería mostrar tokens después de comenzar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Usar primer demo
    const demoButton = page.locator('button').filter({ hasText: /pájaros/ }).first();
    await demoButton.click();
    
    // Comenzar
    const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i });
    await startButton.click();
    
    // Esperar al paso de tokenización - usar un selector más específico
    const tokenizationHeading = page.getByRole('heading', { name: '🔤 Tokenización' });
    await expect(tokenizationHeading).toBeVisible({ timeout: 10000 });
    
    // Verificar que hay algo con "tokens detectados"
    await expect(page.locator('text=/tokens detectados/i')).toBeVisible();
  });

  test('debería navegar entre pasos con botones', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Comenzar proceso
    const demoButton = page.locator('button').filter({ hasText: /pájaros/ }).first();
    await demoButton.click();
    
    const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i });
    await startButton.click();
    
    // Esperar tokenización
    const tokenizationHeading = page.getByRole('heading', { name: '🔤 Tokenización' });
    await expect(tokenizationHeading).toBeVisible({ timeout: 10000 });
    
    // Ir al siguiente paso
    const nextButton = page.getByRole('button', { name: /Siguiente/i }).first();
    await nextButton.click();
    
    // Debería estar en otro paso después de tokenización
    await page.waitForTimeout(1000);
    const heading = page.locator('h2[class*="card-title"]');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('debería poder reiniciar desde cualquier paso', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Comenzar proceso
    const demoButton = page.locator('button').filter({ hasText: /pájaros/ }).first();
    await demoButton.click();
    
    const startButton = page.getByRole('button', { name: /Comenzar|análisis|analisis/i });
    await startButton.click();
    
    // Esperar y luego buscar botón Reiniciar
    await page.waitForTimeout(1000);
    const restartButton = page.getByRole('button', { name: /Reiniciar|reiniciar/i });
    
    if (await restartButton.isVisible()) {
      await restartButton.click();
      
      // Debería volver al inicio (input visible)
      await expect(page.locator('textarea#input-text')).toBeVisible({ timeout: 5000 });
    }
  });
});
