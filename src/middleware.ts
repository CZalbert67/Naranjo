import { defineMiddleware } from 'astro:middleware';
import { parseSessionToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const isProtectedPath = pathname.startsWith('/operario') || pathname.startsWith('/dashboard');

  if (isProtectedPath) {
    // Usar la API nativa de Astro context.cookies para lectura de cookies SSR
    const cookieToken = context.cookies.get('session_token')?.value;
    const session = cookieToken ? parseSessionToken(cookieToken) : null;

    // Si no hay sesión válida en la cookie, forzar la redirección inmediata al login (/)
    if (!session) {
      return context.redirect('/?error=unauthorized');
    }

    // Para la ruta /dashboard, exigir el rol de Administrador de TI
    if (pathname.startsWith('/dashboard') && session.rol !== 'Administrador') {
      return context.redirect('/operario?error=access_denied');
    }
  }

  return next();
});
