import type { Gestion, GestionDTO } from "./types";
import { dtoToGestion } from "./types";

const BASE = `${import.meta.env.VITE_API_URL}/gestiones`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let data: any = null;
  try { data = await res.json(); } catch {}
  throw new Error(data?.message || res.statusText);
}

export async function listGestiones(q?: string) {
  const url = q ? `${BASE}?q=${encodeURIComponent(q)}` : BASE;
  const res = await fetch(url, { headers: authHeaders() });
  const json = await handle<{ data: GestionDTO[] }>(res);
  return { data: json.data.map(dtoToGestion) as Gestion[] };
}

export async function createGestion(p: {
  anio: number; periodo: number; fecha_ini: string; fecha_fin: string;
}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(p),
  });
  const json = await handle<{ data: GestionDTO }>(res);
  return { data: dtoToGestion(json.data) };
}

export async function updateGestion(id: number, p: {
  anio: number; periodo: number; fecha_ini: string; fecha_fin: string;
}) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(p),
  });
  const json = await handle<{ data: GestionDTO }>(res);
  return { data: dtoToGestion(json.data) };
}
