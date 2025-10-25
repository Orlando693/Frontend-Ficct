export type RolBase = "Decanato" | "CPD" | "Jefatura" | "Docente"
export type EstadoUsuario = "ACTIVO" | "BLOQUEADO" | "PENDIENTE" | "INACTIVO"

export interface Usuario {
  id: number
  nombre: string
  username?: string
  correo: string
  telefono?: string
  rol: RolBase
  estado: EstadoUsuario
  conHorarios?: boolean // para simular regla de no-borrado (docente con horarios)
  creado?: string
}

