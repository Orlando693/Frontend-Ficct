export type LogEvent = {
  id: number | string
  modulo: string
  accion: string
  descripcion: string | null
  usuario: string | null
  ip: string | null
  created_at: string       // del backend
  at: string               // alias normalizado que usa la UI
  entidad?: string | null  // opcional; la UI lo muestra si viene
}

export type BitacoraRow = LogEvent
