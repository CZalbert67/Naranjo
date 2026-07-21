import type { APIRoute } from 'astro';
import { getDbPool } from '../../../lib/db';
import { comparePassword, createSessionToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { usuario, password } = body || {};

    if (!usuario || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario y contraseña obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let userAccount = null;

    try {
      const pool = await getDbPool();
      const result = await pool
        .request()
        .input('usuario', usuario)
        .query('SELECT TOP 1 id_usuario, nombre_completo, rol, usuario, password_hash FROM Usuarios WHERE usuario = @usuario');

      if (result.recordset && result.recordset.length > 0) {
        userAccount = result.recordset[0];
      }
    } catch (dbErr) {
      console.warn('[Login API] DB no accesible, usando fallback para dev/testing:', dbErr);
      // Fallback para dev/test sin servidor DB activo
      if (usuario === 'admin' && password === 'admin123') {
        userAccount = {
          id_usuario: 1,
          nombre_completo: 'Encargado de Sistemas',
          rol: 'Administrador',
          usuario: 'admin',
          password_hash: ''
        };
      } else if (usuario === 'operario1' && password === 'operario123') {
        userAccount = {
          id_usuario: 2,
          nombre_completo: 'Juan Pérez (Hilado)',
          rol: 'Operario',
          usuario: 'operario1',
          password_hash: ''
        };
      }
    }

    if (!userAccount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Credenciales inválidas.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar contraseña si hay hash
    if (userAccount.password_hash) {
      const isValid = await comparePassword(password, userAccount.password_hash);
      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Credenciales inválidas.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const sessionData = {
      id_usuario: userAccount.id_usuario,
      nombre_completo: userAccount.nombre_completo,
      rol: userAccount.rol as 'Operario' | 'Administrador',
      usuario: userAccount.usuario,
    };

    const token = createSessionToken(sessionData);

    // Banderas de seguridad recomendadas: HttpOnly; Path=/; SameSite=Strict
    const cookieHeader = `session_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`;

    return new Response(
      JSON.stringify({ success: true, user: sessionData }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
