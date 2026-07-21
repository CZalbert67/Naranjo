import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

// En-memoria fallback para dev/testing cuando SQL Server local no está disponible
let inMemoryTickets = [
  {
    id_ticket: 1,
    id_usuario: 2,
    nombre_usuario: 'Juan Pérez (Hilado)',
    id_equipo: 1,
    nombre_equipo: 'Impresora de Etiquetas',
    nombre_area: 'Área de Hilado',
    descripcion: 'Falla en la etiquetadora térmica, no imprime o se pierde la conexión de red.',
    estado: 'Pendiente',
    fecha_reporte: new Date().toISOString(),
  },
  {
    id_ticket: 2,
    id_usuario: 2,
    nombre_usuario: 'Juan Pérez (Hilado)',
    id_equipo: 5,
    nombre_equipo: 'Router Industrial',
    nombre_area: 'Tejeduría',
    descripcion: 'Caída de red y pérdida de señal Wi-Fi en el Access Point (AP) del piso.',
    estado: 'En Proceso',
    fecha_reporte: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    try {
      const pool = await getDbPool();
      const result = await pool.request().query(`
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
        ORDER BY t.fecha_reporte DESC
      `);

      return new Response(JSON.stringify(result.recordset), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (dbErr) {
      console.warn('[Tickets GET API] DB no disponible, usando inMemoryTickets fallback:', dbErr);
      return new Response(JSON.stringify(inMemoryTickets), {
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
        estado: estadoInicial,
        fecha_reporte: new Date().toISOString(),
      };
      inMemoryTickets.unshift(mockNewTicket);

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
