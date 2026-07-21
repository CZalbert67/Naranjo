import type { APIRoute } from 'astro';
import { getDbPool } from '../../lib/db';

const defaultAreas = [
  { id_area: 1, nombre_area: 'Área de Hilado' },
  { id_area: 2, nombre_area: 'Tejeduría' },
  { id_area: 3, nombre_area: 'Almacén' },
  { id_area: 4, nombre_area: 'Oficinas / Administración' },
];

const defaultEquipos = [
  // Equipos estrictamente de Soporte de TI
  { id_equipo: 1, id_area: 1, tipo_equipo: 'Impresora de Etiquetas' },
  { id_equipo: 2, id_area: 1, tipo_equipo: 'PC / Terminal Industrial' },
  { id_equipo: 3, id_area: 1, tipo_equipo: 'Access Point (AP Wi-Fi)' },
  { id_equipo: 4, id_area: 2, tipo_equipo: 'Cámara de Seguridad IP' },
  { id_equipo: 5, id_area: 2, tipo_equipo: 'Router Industrial' },
  { id_equipo: 6, id_area: 2, tipo_equipo: 'PC / Monitor de Control' },
  { id_equipo: 7, id_area: 3, tipo_equipo: 'Impresora Departamental' },
  { id_equipo: 8, id_area: 3, tipo_equipo: 'Etiquetadora Térmica Barcode' },
  { id_equipo: 9, id_area: 3, tipo_equipo: 'Access Point (AP Wi-Fi)' },
  { id_equipo: 10, id_area: 4, tipo_equipo: 'PC de Escritorio' },
  { id_equipo: 11, id_area: 4, tipo_equipo: 'Router / Switch de Red' },
  { id_equipo: 12, id_area: 4, tipo_equipo: 'Impresora Multifuncional' },
];

export const GET: APIRoute = async () => {
  try {
    try {
      const pool = await getDbPool();
      const areasResult = await pool.request().query('SELECT id_area, nombre_area FROM Areas ORDER BY nombre_area');
      const equiposResult = await pool.request().query('SELECT id_equipo, id_area, tipo_equipo FROM Equipos ORDER BY tipo_equipo');

      return new Response(
        JSON.stringify({
          areas: areasResult.recordset,
          equipos: equiposResult.recordset,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbErr) {
      console.warn('[Catalogs API] DB no disponible, entregando catálogos de TI por defecto:', dbErr);
      return new Response(
        JSON.stringify({
          areas: defaultAreas,
          equipos: defaultEquipos,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al obtener catálogos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
