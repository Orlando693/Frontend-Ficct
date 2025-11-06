import type { Materia, MateriaDTO, MateriaEstado } from "./types";
import { dtoToModel } from "./types";

const BASE = `${import.meta.env.VITE_API_URL}/materias`;

// 👉 Siempre devuelve un objeto plano { [k: string]: string }
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let data: any = null;
  try { data = await res.json(); } catch {}
  const message = data?.message || res.statusText;
  throw new Error(message);
}

export async function listMaterias(params?: { q?: string; estado?: "todas" | MateriaEstado }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todas") qs.set("estado", params.estado);
  const url = `${BASE}${qs.toString() ? "?" + qs.toString() : ""}`;

  const res = await fetch(url, { headers: authHeaders() });
  const json = await handle<{ data: MateriaDTO[] }>(res);
  return { data: json.data.map(dtoToModel) as Materia[] };
}

export async function createMateria(payload: { codigo: string; nombre: string; creditos: number }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: MateriaDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function updateMateria(id: number, payload: { codigo: string; nombre: string; creditos: number }) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: MateriaDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function setEstadoMateria(id: number, estado: MateriaEstado) {
  const res = await fetch(`${BASE}/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ estado }),
  });
  const json = await handle<{ data: MateriaDTO }>(res);
  return { data: dtoToModel(json.data) };
}
