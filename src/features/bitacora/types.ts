export type LogEvent = {
  id: number | string
  modulo: string
  accion: string
  descripcion: string | null
  usuario: string | null
  ip: string | null
  created_at: string
}

export type BitacoraRow = LogEvent
