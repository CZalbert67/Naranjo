import bcrypt from 'bcryptjs';

export interface UserSession {
  id_usuario: number;
  nombre_completo: string;
  rol: 'Operario' | 'Administrador';
  usuario: string;
}

// PT-01: Funciones de encriptación y comparación de contraseñas
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Utilidad para codificar token de sesión simple (base64 + firma o JSON)
export function createSessionToken(user: UserSession): string {
  const payload = JSON.stringify(user);
  return Buffer.from(payload).toString('base64');
}

export function parseSessionToken(token: string): UserSession | null {
  try {
    const payload = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(payload) as UserSession;
  } catch {
    return null;
  }
}

export function getSessionFromCookie(cookieHeader: string | null): UserSession | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session_token=([^;]+)/);
  if (!match) return null;
  return parseSessionToken(match[1]);
}
