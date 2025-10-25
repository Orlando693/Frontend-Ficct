export type EstadoRol = "ACTIVO" | "INACTIVO"

export type Modulo =
  | "Usuarios"
  | "Materias"
  | "Grupos"
  | "Aulas"
  | "Programacion"
  | "Asistencia"
  | "Reportes"

export type PermSet = {
  ver: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
}

export interface Rol {
  id: number
  nombre: string
  descripcion?: string
  estado: EstadoRol
  permisos: Record<Modulo, PermSet>
}
