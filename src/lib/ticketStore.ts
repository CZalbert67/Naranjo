export interface TicketItem {
  id_ticket: number;
  id_usuario: number;
  nombre_usuario: string;
  id_equipo: number;
  nombre_equipo: string;
  nombre_area: string;
  descripcion: string;
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto';
  fecha_reporte: string;
}

export let inMemoryTickets: TicketItem[] = [
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

export function updateInMemoryTicketStatus(id_ticket: number, nuevoEstado: 'Pendiente' | 'En Proceso' | 'Resuelto'): boolean {
  const ticket = inMemoryTickets.find((t) => t.id_ticket === id_ticket);
  if (ticket) {
    ticket.estado = nuevoEstado;
    return true;
  }
  return false;
}

export function addInMemoryTicket(ticket: TicketItem) {
  inMemoryTickets.unshift(ticket);
}
