import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';
import { inMemoryUsers } from './index';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const userId = parseInt(id || '', 10);

    if (isNaN(userId)) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { nombre_completo, usuario, rol, estado_usuario } = body || {};

    // Actualizar copia en memoria
    const memUser = inMemoryUsers.find((u) => u.id_usuario === userId);
    if (memUser) {
      if (nombre_completo) memUser.nombre_completo = nombre_completo;
      if (usuario) memUser.usuario = usuario;
      if (rol) memUser.rol = rol;
      if (estado_usuario) memUser.estado_usuario = estado_usuario;
    }

    try {
      const pool = await getDbPool();
      await pool
        .request()
        .input('id_usuario', userId)
        .input('nombre_completo', nombre_completo)
        .input('usuario', usuario)
        .input('rol', rol)
        .input('estado_usuario', estado_usuario)
        .query(`
          UPDATE Usuarios
          SET 
            nombre_completo = ISNULL(@nombre_completo, nombre_completo),
            usuario = ISNULL(@usuario, usuario),
            rol = ISNULL(@rol, rol),
            estado_usuario = ISNULL(@estado_usuario, estado_usuario)
          WHERE id_usuario = @id_usuario
        `);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario #${userId} actualizado exitosamente.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Users PUT API] DB no disponible, actualizado en memoria:', dbErr);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario #${userId} actualizado exitosamente en memoria.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al actualizar usuario.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const userId = parseInt(id || '', 10);

    if (isNaN(userId)) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar de memoria
    const index = inMemoryUsers.findIndex((u) => u.id_usuario === userId);
    if (index !== -1) {
      inMemoryUsers.splice(index, 1);
    }

    try {
      const pool = await getDbPool();
      // Eliminar tickets asociados primero o desvincular
      await pool.request().input('id_usuario', userId).query('DELETE FROM Tickets WHERE id_usuario = @id_usuario');
      await pool.request().input('id_usuario', userId).query('DELETE FROM Usuarios WHERE id_usuario = @id_usuario');

      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario #${userId} eliminado del sistema.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Users DELETE API] DB no disponible, eliminado de memoria:', dbErr);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario #${userId} eliminado de memoria.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al eliminar usuario.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
