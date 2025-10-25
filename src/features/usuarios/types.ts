export type RolBase = "Decanato" | "CPD" | "Jefatura" | "Docente" | string
export type EstadoUsuario = "ACTIVO" | "BLOQUEADO" | "PENDIENTE" | "INACTIVO"

export interface Usuario {
  id: number
  nombre: string
  username?: string
  correo: string
  telefono?: string
  rol: RolBase
  estado: EstadoUsuario
  conHorarios?: boolean
  creado?: string
}
