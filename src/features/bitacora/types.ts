export type ResultadoLog = "OK" | "ERROR" | "DENEGADO"

export interface LogEvent {
  id: number
  at: string                 // ISO date
  usuario?: string           // nombre o username/correo
  actor?: string             // rol: CPD, Decanato, etc.
  modulo: string             // Usuarios, Carreras, Reportes, etc.
  accion: string             // crear, editar, login, export_csv, etc.
  entidad?: string           // “Usuario:jlopez”, “Carrera:SIS”, …
  resultado: ResultadoLog
  ip?: string
  detalle?: string           // resumen legible
  filtros?: Record<string, any> // filtros usados (para reportes/consultas)
}
