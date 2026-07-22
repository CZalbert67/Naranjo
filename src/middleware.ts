import { defineMiddleware } from 'astro:middleware';
import { getSessionFromCookie } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Rutas que requieren autenticación previa obligatoria
  const isProtectedPath = pathname.startsWith('/operario') || pathname.startsWith('/dashboard');

  if (isProtectedPath) {
    const cookieHeader = context.request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    // Si la URL fue copiada o pegada directamente sin haber iniciado sesión previa
    if (!session) {
      return context.redirect('/?error=unauthorized');
    }

    // Para la ruta /dashboard, exigir estrictamente el rol de Administrador de TI
    if (pathname.startsWith('/dashboard') && session.rol !== 'Administrador') {
      return context.redirect('/operario?error=access_denied');
    }
  }

  return next();
});
