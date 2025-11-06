import type {
  GrupoEstado, Grupo, GrupoDTO, GestionDTO, MateriaMiniDTO, Turno
} from "./types";
import { dtoToModel } from "./types";

const BASE = `${import.meta.env.VITE_API_URL}`;

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

// Catálogos
export async function listGestiones() {
  const res = await fetch(`${BASE}/gestiones`, { headers: authHeaders() });
  const json = await handle<{ data: GestionDTO[] }>(res);
  return json.data;
}

export async function listMateriasActivas() {
  const url = `${BASE}/materias?estado=ACTIVA`;
  const res = await fetch(url, { headers: authHeaders() });
  const json = await handle<{ data: MateriaMiniDTO[] | any[] }>(res);
  // si viene con más campos, mapeamos mínimos
  return (json.data as any[]).map((m) => ({
    id_materia: m.id_materia ?? m.id,
    codigo: m.codigo,
    nombre: m.nombre,
  })) as MateriaMiniDTO[];
}

// Grupos
export async function listGrupos(params?: {
  q?: string;
  estado?: "todos" | GrupoEstado;
  gestion_id?: number;
  materia_id?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todos") qs.set("estado", params.estado);
  if (params?.gestion_id) qs.set("gestion_id", String(params.gestion_id));
  if (params?.materia_id) qs.set("materia_id", String(params.materia_id));

  const res = await fetch(`${BASE}/grupos${qs.toString() ? "?" + qs.toString() : ""}`, {
    headers: authHeaders(),
  });
  const json = await handle<{ data: GrupoDTO[] }>(res);
  return { data: json.data.map(dtoToModel) as Grupo[] };
}

export async function createGrupo(payload: {
  gestion_id: number;
  materia_id: number;           // el back mapea a materia_carrera_id
  paralelo: string;
  turno: Turno;
  capacidad: number;
}) {
  const res = await fetch(`${BASE}/grupos`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: GrupoDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function updateGrupo(id: number, payload: {
  gestion_id: number;
  materia_id: number;
  paralelo: string;
  turno: Turno;
  capacidad: number;
}) {
  const res = await fetch(`${BASE}/grupos/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const json = await handle<{ data: GrupoDTO }>(res);
  return { data: dtoToModel(json.data) };
}

export async function setEstadoGrupo(id: number, estado: GrupoEstado) {
  const res = await fetch(`${BASE}/grupos/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ estado }),
  });
  const json = await handle<{ data: GrupoDTO }>(res);
  return { data: dtoToModel(json.data) };
}
