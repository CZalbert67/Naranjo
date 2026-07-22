import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';
import { inMemoryTickets, addInMemoryTicket } from '../../../lib/ticketStore';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const isMine = url.searchParams.get('mine') === 'true';
    const paramUserId = url.searchParams.get('id_usuario');
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    let filterUserId: number | null = null;

    if (isMine) {
      if (session) {
        filterUserId = session.id_usuario;
      } else {
        // Fallback para dev/test si no hay cookie de sesión activa: id_usuario operario por defecto (2)
        filterUserId = 2;
      }
    } else if (paramUserId) {
      const parsed = parseInt(paramUserId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        filterUserId = parsed;
      }
    }

    try {
      const pool = await getDbPool();
      let query = `
        SELECT 
          t.id_ticket,
          t.id_usuario,
          u.nombre_completo as nombre_usuario,
          t.id_equipo,
          e.tipo_equipo as nombre_equipo,
          a.nombre_area,
          t.descripcion,
          t.estado,
          t.fecha_reporte
        FROM Tickets t
        INNER JOIN Usuarios u ON t.id_usuario = u.id_usuario
        INNER JOIN Equipos e ON t.id_equipo = e.id_equipo
        INNER JOIN Areas a ON e.id_area = a.id_area
      `;

      if (filterUserId) {
        query += ` WHERE t.id_usuario = @id_usuario `;
      }

      query += ` ORDER BY t.fecha_reporte DESC `;

      const req = pool.request();
      if (filterUserId) {
        req.input('id_usuario', filterUserId);
      }

      const result = await req.query(query);

      return new Response(JSON.stringify(result.recordset), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (dbErr) {
      console.warn('[Tickets GET API] DB no disponible, usando inMemoryTickets fallback:', dbErr);
      let list = inMemoryTickets;
      if (filterUserId) {
        list = list.filter((t) => t.id_usuario === filterUserId);
      }
      return new Response(JSON.stringify(list), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al obtener tickets' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    let { id_usuario, id_equipo, descripcion } = body || {};

    if (!id_usuario) {
      const cookieHeader = request.headers.get('cookie');
      const session = getSessionFromCookie(cookieHeader);
      if (session) {
        id_usuario = session.id_usuario;
      }
    }

    if (!id_equipo || !descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'Bad Request: id_equipo y descripcion son campos obligatorios.',
          code: 400
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!id_usuario) {
      id_usuario = 2;
    }

    const estadoInicial = 'Pendiente';

    try {
      const pool = await getDbPool();
      const result = await pool
        .request()
        .input('id_usuario', id_usuario)
        .input('id_equipo', id_equipo)
        .input('descripcion', descripcion.trim())
        .input('estado', estadoInicial)
        .query(`
          INSERT INTO Tickets (id_usuario, id_equipo, descripcion, estado, fecha_reporte)
          OUTPUT INSERTED.id_ticket, INSERTED.fecha_reporte
          VALUES (@id_usuario, @id_equipo, @descripcion, @estado, GETDATE())
        `);

      const newTicket = result.recordset[0];
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Orden de trabajo registrada exitosamente.',
          ticket: {
            id_ticket: newTicket.id_ticket,
            id_usuario,
            id_equipo,
            descripcion,
            estado: estadoInicial,
            fecha_reporte: newTicket.fecha_reporte,
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Tickets POST API] DB no disponible, insertando en memoria:', dbErr);
      const mockNewTicket = {
        id_ticket: inMemoryTickets.length + 1,
        id_usuario,
        nombre_usuario: 'Operario Planta',
        id_equipo: Number(id_equipo),
        nombre_equipo: `Equipo TI #${id_equipo}`,
        nombre_area: 'Área de Hilado',
        descripcion: descripcion.trim(),
        estado: estadoInicial as 'Pendiente' | 'En Proceso' | 'Resuelto',
        fecha_reporte: new Date().toISOString(),
      };
      addInMemoryTicket(mockNewTicket);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Orden de trabajo registrada exitosamente.',
          ticket: mockNewTicket,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al crear la orden de trabajo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
