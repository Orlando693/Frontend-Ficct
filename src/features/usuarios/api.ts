import { apiFetch } from "../../lib/api";
import type { Usuario, UsuarioForm, Paged } from "./types";

export async function getUsers(params?: { q?: string; rol?: string; estado?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.rol) search.set("rol", params.rol);
  if (params?.estado) search.set("estado", params.estado);
  if (params?.page) search.set("page", String(params.page));
  const qs = search.toString();
  return apiFetch(`/users${qs ? `?${qs}` : ""}`) as Promise<Paged<Usuario>>;
}

export async function createUser(input: UsuarioForm): Promise<Usuario> {
  return apiFetch(`/users`, { method: "POST", body: JSON.stringify(input) });
}

export async function updateUser(id: number, input: UsuarioForm): Promise<Usuario> {
  return apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function changeUserRole(id: number, rol: Usuario["rol"]): Promise<Usuario> {
  return apiFetch(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ rol }) });
}

export async function toggleBlockUser(id: number): Promise<Usuario> {
  return apiFetch(`/users/${id}/toggle-block`, { method: "PATCH" });
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}
