export type EstadoCarrera = "ACTIVA" | "INACTIVA"

export interface Carrera {
  id: number
  nombre: string
  sigla: string
  estado: EstadoCarrera
  materiasAsociadas: number
  gruposAsociados: number
}
