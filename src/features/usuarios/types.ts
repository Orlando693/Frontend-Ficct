// Tipos que usa tu UI
export type RolBase = "Decanato" | "CPD" | "Jefatura" | "Docente";
export type EstadoUsuario = "ACTIVO" | "BLOQUEADO" | "PENDIENTE" | "INACTIVO";

export interface Usuario {
  id: number;
  nombre: string;
  username: string | null;
  correo: string;
  telefono: string | null;
  rol: RolBase;
  estado: EstadoUsuario;
  creado?: string | null;
  temp_password?: string | null;
}

// Si tu modal usa este tipo puedes mantenerlo; si no, puedes borrarlo
export interface UsuarioForm {
  nombre: string;
  correo: string;
  username?: string | null;
  telefono?: string | null;
  rol: RolBase;
  estado?: EstadoUsuario;
  password?: string;
  
}

// Para respuestas paginadas del backend (si las necesitas en otro lado)
export interface Paged<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}
