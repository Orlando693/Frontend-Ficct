// frontend/src/features/usuarios/api.ts
import { apiFetch } from "../../lib/api";

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
}

export interface UsuarioForm {
  nombre: string;
  correo: string;
  username?: string | null;
  telefono?: string | null;
  rol: RolBase;
  estado?: EstadoUsuario;
  password?: string;
}

export interface Paged<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}

/* ===== impl ===== */

export async function list(params?: { q?: string; rol?: string; estado?: string; page?: number }): Promise<Usuario[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.rol) qs.set("rol", params.rol);
  if (params?.estado) qs.set("estado", params.estado);
  if (typeof params?.page === "number") qs.set("page", String(params.page));

  const r = await apiFetch(`/users${qs.toString() ? `?${qs.toString()}` : ""}`);
  // backend devuelve { data, meta } — devolvemos siempre array de Usuarios
  if (Array.isArray(r)) return r as Usuario[];
  if (r && Array.isArray((r as Paged<Usuario>).data)) return (r as Paged<Usuario>).data;
  return [];
}

export async function create(payload: UsuarioForm | Omit<Usuario, "id">): Promise<Usuario> {
  return apiFetch(`/users`, { method: "POST", body: JSON.stringify(payload) });
}

export async function update(id: number, payload: Partial<Usuario> | UsuarioForm): Promise<Usuario> {
  return apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function changeRole(id: number, rol: RolBase): Promise<Usuario> {
  return apiFetch(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ rol }) });
}

// Tu UI usa setEstado("ACTIVO"/"BLOQUEADO"); en backend tenemos toggle.
// Esta función llama al toggle y retorna el usuario actualizado.
export async function setEstado(id: number, _estado: EstadoUsuario): Promise<Usuario> {
  return apiFetch(`/users/${id}/toggle-block`, { method: "PATCH" });
}

export async function remove(id: number): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}

export async function resetPassword(id: number): Promise<Usuario> {
  // Si no tenés endpoint dedicado, hacemos PUT con password temporal
  return apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify({ password: "12345678" }) });
}

/* ===== export default que tu UI espera (api.list, api.create, etc.) ===== */
const api = {
  list,
  create,
  update,
  changeRole,
  setEstado,
  remove,
  resetPassword,
};

export default api;
