import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  const expiredCookie = 'session_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0';
  return new Response(
    JSON.stringify({ success: true, message: 'Sesión cerrada exitosamente.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': expiredCookie,
      },
    }
  );
};
