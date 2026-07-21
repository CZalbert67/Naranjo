import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/lib/auth';

describe('Prueba de Seguridad (PT-01): Encriptación y Verificación de Contraseñas', () => {
  it('debe generar un hash válido y retornar true al comparar con la contraseña correcta', async () => {
    const plainPassword = 'contraseña_segura_123';
    const hash = await hashPassword(plainPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plainPassword);

    const match = await comparePassword(plainPassword, hash);
    expect(match).toBe(true);
  });

  it('debe retornar false al comparar con una contraseña incorrecta', async () => {
    const plainPassword = 'contraseña_segura_123';
    const wrongPassword = 'contraseña_erronea_999';
    const hash = await hashPassword(plainPassword);

    const match = await comparePassword(wrongPassword, hash);
    expect(match).toBe(false);
  });
});
