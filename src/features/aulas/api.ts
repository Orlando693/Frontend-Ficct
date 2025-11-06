import type { Aula, AulaDTO, AulaEstado, AulaTipo } from "./types";
import { dtoToModel } from "./types";

const BASE = `${import.meta.env.VITE_API_URL}/aulas`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let data: any = null;
  try { data = await res.json(); } catch {}
  throw new Error(data?.message || res.statusText);
}

export async function listAulas(params?: {
  q?: string;
  estado?: "todas" | AulaEstado;
  tipo?: "todos" | AulaTipo;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todas") qs.set("estado", params.estado);
  if (params?.tipo && params.tipo !== "todos") qs.set("tipo", params.tipo);

  const res = await fetch(`${BASE}${qs.toString() ? "?" + qs.toString() : ""}`, {
    headers: authHeaders(),
  });
  const json = await handle<{ data: AulaDTO[] }>(res);
  return { data: json.data.map(dtoToModel) as Aula[] };
}

export async function createAula(payload: {
  numero: string;
  tipo: AulaTipo;
  capacidad: number;
  piso?: number | null;
}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: AulaDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function updateAula(id: number, payload: {
  numero: string;
  tipo: AulaTipo;
  capacidad: number;
  piso?: number | null;
}) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: AulaDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function setEstadoAula(id: number, estado: AulaEstado) {
  const res = await fetch(`${BASE}/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ estado }),
  });
  const json = await handle<{ data: AulaDTO }>(res);
  return { data: dtoToModel(json.data) };
}
