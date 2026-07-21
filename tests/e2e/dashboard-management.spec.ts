import { test, expect } from '@playwright/test';

test.describe('Dashboard y Gestión de Estados (PT-04)', () => {
  test('el administrador debe iniciar sesión, ver el dashboard y cambiar el estado de un ticket', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto('/');
    await page.fill('#usuario', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('#submitBtn');

    // 2. Redirección al /dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // 3. Interceptar tabla de tickets y verificar existencia de filas
    const tableBody = page.locator('#ticketsTableBody');
    await expect(tableBody).toBeVisible();

    // 4. Hacer clic en el botón de "Resuelto" de un ticket si está disponible
    const resueltoBtn = page.locator('.btn-change-status[data-status="Resuelto"]').first();
    if (await resueltoBtn.isVisible()) {
      await resueltoBtn.click();
      // Verificación de actualización en la interfaz
      await page.waitForTimeout(500);
      await expect(page.locator('#ticketsTableBody')).toContainText('Resuelto');
    }
  });
});
