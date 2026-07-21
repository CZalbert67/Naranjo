import { describe, it, expect } from 'vitest';
import { POST } from '../../src/pages/api/tickets/index';

describe('Prueba de Integridad de Datos (PT-02): Validación del Formulario de Tickets', () => {
  it('debe retornar error 400 Bad Request cuando falta id_equipo en el payload', async () => {
    const invalidPayload = {
      // id_equipo faltante
      descripcion: 'Falla sin especificar el equipo afectado',
    };

    const request = new Request('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    // @ts-ignore
    const response = await POST({ request, params: {}, cookies: {} } as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('id_equipo');
  });

  it('debe retornar error 400 Bad Request cuando la descripción está vacía', async () => {
    const invalidPayload = {
      id_equipo: 1,
      descripcion: '   ',
    };

    const request = new Request('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    // @ts-ignore
    const response = await POST({ request, params: {}, cookies: {} } as any);
    expect(response.status).toBe(400);
  });

  it('debe aceptar y procesar un payload válido retornando HTTP 201 Created', async () => {
    const validPayload = {
      id_equipo: 1,
      descripcion: 'Prueba unitaria de reporte de falla técnica',
    };

    const request = new Request('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    // @ts-ignore
    const response = await POST({ request, params: {}, cookies: {} } as any);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.ticket).toBeDefined();
  });
});
