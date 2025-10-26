export type Rol = "Decanato" | "CPD" | "Jefatura" | "Docente";
export type Estado = "ACTIVO" | "BLOQUEADO" | "PENDIENTE" | "INACTIVO";

export interface Usuario {
  id: number;
  nombre: string;
  username: string | null;
  correo: string;
  telefono: string | null;
  rol: Rol;
  estado: Estado;
  creado?: string | null;
}

// Lo que envías al crear/editar
export interface UsuarioForm {
  nombre: string;
  correo: string;
  username?: string | null;
  telefono?: string | null;
  rol: Rol;
  estado?: Estado;
  password?: string;
}

// (opcional) si usas paginado del backend
export interface Paged<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
