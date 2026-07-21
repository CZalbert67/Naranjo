import { test, expect } from '@playwright/test';

test.describe('Levantamiento de Orden de Trabajo (PT-03)', () => {
  test('un operario debe poder reportar una falla desde el formulario web', async ({ page }) => {
    // 1. Navegar a /operario
    await page.goto('/operario');

    // 2. Seleccionar Área y Equipo en los desplegables
    await page.waitForSelector('#selectArea option[value="1"]');
    await page.selectOption('#selectArea', '1');

    await page.waitForSelector('#selectEquipo option');
    await page.selectOption('#selectEquipo', '1');

    // 3. Escribir en el textarea la descripción de la falla
    await page.fill('#descripcion', 'Prueba E2E: Falla en la impresora de etiquetas del piso de hilado.');

    // 4. Presionar "Enviar Reporte"
    await page.click('#btnSendTicket');

    // 5. Verificar que aparece la alerta de éxito en pantalla
    const successAlert = page.locator('#ticketSuccessAlert');
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText('Reporte Enviado Exitosamente');
  });
});
