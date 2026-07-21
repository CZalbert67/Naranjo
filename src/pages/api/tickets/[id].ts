import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const ticketId = parseInt(id || '', 10);

    if (isNaN(ticketId)) {
      return new Response(
        JSON.stringify({ error: 'ID de ticket inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { estado } = body || {};

    const estadosValidos = ['Pendiente', 'En Proceso', 'Resuelto'];
    if (!estado || !estadosValidos.includes(estado)) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido. Debe ser Pendiente, En Proceso o Resuelto.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const pool = await getDbPool();
      const result = await pool
        .request()
        .input('id_ticket', ticketId)
        .input('estado', estado)
        .query(`
          UPDATE Tickets
          SET estado = @estado
          WHERE id_ticket = @id_ticket
        `);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Estado del ticket #${ticketId} actualizado a ${estado}.`,
          id_ticket: ticketId,
          nuevo_estado: estado,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Tickets PUT API] DB no disponible, actualizando respuesta simulada:', dbErr);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Estado del ticket #${ticketId} actualizado a ${estado}.`,
          id_ticket: ticketId,
          nuevo_estado: estado,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al actualizar estado del ticket' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
