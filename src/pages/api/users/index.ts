import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';

let inMemoryUsers = [
  { id_usuario: 1, nombre_completo: 'Encargado de Sistemas', usuario: 'admin', rol: 'Administrador' },
  { id_usuario: 2, nombre_completo: 'Juan Pérez (Hilado)', usuario: 'operario1', rol: 'Operario' },
];

export const GET: APIRoute = async () => {
  try {
    try {
      const pool = await getDbPool();
      const result = await pool.request().query('SELECT id_usuario, nombre_completo, usuario, rol FROM Usuarios ORDER BY id_usuario DESC');
      return new Response(JSON.stringify(result.recordset), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (dbErr) {
      console.warn('[Users GET API] DB no disponible, usando inMemoryUsers:', dbErr);
      return new Response(JSON.stringify(inMemoryUsers), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al obtener usuarios.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { nombre_completo, usuario, password, rol } = body || {};

    if (!nombre_completo || !usuario || !password || !rol) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos (nombre, usuario, contraseña, rol) son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['Operario', 'Administrador'].includes(rol)) {
      return new Response(
        JSON.stringify({ error: 'El rol debe ser Operario o Administrador.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const password_hash = await hashPassword(password);

    try {
      const pool = await getDbPool();
      
      // Verificar si el usuario ya existe
      const checkUser = await pool
        .request()
        .input('usuario', usuario)
        .query('SELECT id_usuario FROM Usuarios WHERE usuario = @usuario');

      if (checkUser.recordset && checkUser.recordset.length > 0) {
        return new Response(
          JSON.stringify({ error: 'El nombre de usuario ya está registrado.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const result = await pool
        .request()
        .input('nombre_completo', nombre_completo.trim())
        .input('rol', rol)
        .input('usuario', usuario.trim())
        .input('password_hash', password_hash)
        .query(`
          INSERT INTO Usuarios (nombre_completo, rol, usuario, password_hash)
          OUTPUT INSERTED.id_usuario
          VALUES (@nombre_completo, @rol, @usuario, @password_hash)
        `);

      const newId = result.recordset[0].id_usuario;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario ${usuario} creado exitosamente como ${rol}.`,
          user: { id_usuario: newId, nombre_completo, usuario, rol },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Users POST API] DB no disponible, guardando en memoria:', dbErr);
      const mockUser = {
        id_usuario: inMemoryUsers.length + 1,
        nombre_completo: nombre_completo.trim(),
        usuario: usuario.trim(),
        rol,
      };
      inMemoryUsers.unshift(mockUser);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Usuario ${usuario} creado exitosamente como ${rol}.`,
          user: mockUser,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al crear usuario.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
