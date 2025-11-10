import type { AulaMiniDTO, GrupoMiniDTO, HorarioDTO, DisponibilidadResp } from "./types";
import type { GestionDTO } from "../parametros/types";
import { dtoToGestion } from "../parametros/types";

const API = import.meta.env.VITE_API_URL;

function authHeaders(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let j:any=null; try{ j=await res.json(); } catch {}
  throw new Error(j?.message || res.statusText);
}

// ——— Catálogos ———
export async function listGestiones(): Promise<{ data: GestionDTO[] }> {
  const res = await fetch(`${API}/gestiones`, { headers: authHeaders() });
  return handle(res);
}

export async function listAulasActivas() {
  const res = await fetch(`${API}/aulas?estado=activo`, { headers: authHeaders() });
  return handle<{ data: AulaMiniDTO[] }>(res);
}

// grupos por gestión (y opcionalmente por materia)
export async function listGrupos(params: { gestion_id: number; materia_id?: number }) {
  const q = new URLSearchParams();
  q.set("gestion_id", String(params.gestion_id));
  if (params.materia_id) q.set("materia_id", String(params.materia_id));
  const res = await fetch(`${API}/grupos?${q.toString()}`, { headers: authHeaders() });
  return handle<{ data: GrupoMiniDTO[] }>(res);
}

// ——— Listado y creación/eliminación de horarios ———
export async function listHorarios(params: { gestion_id: number; grupo_id?: number }) {
  const q = new URLSearchParams();
  q.set("gestion_id", String(params.gestion_id));
  if (params.grupo_id) q.set("grupo_id", String(params.grupo_id));
  const res = await fetch(`${API}/horarios?${q.toString()}`, { headers: authHeaders() });
  const json = await handle<any>(res);
  const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  return { data: rows as HorarioDTO[] };
}

export async function createHorario(payload: {
  grupo_id: number;
  aula_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}) {
  const res = await fetch(`${API}/horarios`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handle<{ data: HorarioDTO }>(res);
}

export async function deleteHorario(id_horario: number) {
  const res = await fetch(`${API}/horarios/${id_horario}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle<{ ok: boolean }>(res);
}

// ——— CU15: disponibilidad/validación de choques ———
// Ajusta la URL si tu backend usa otra ruta (p.ej. /programacion/disponibilidad o /aulas/disponibles)
export async function checkDisponibilidad(params: {
  gestion_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  grupo_id?: number;
}) {
  const q = new URLSearchParams();
  q.set("gestion_id", String(params.gestion_id));
  q.set("dia_semana", String(params.dia_semana));
  q.set("hora_inicio", params.hora_inicio);
  q.set("hora_fin", params.hora_fin);
  if (params.grupo_id) q.set("grupo_id", String(params.grupo_id));

  const res = await fetch(`${API}/aulas/disponibles?${q.toString()}`, {
    headers: authHeaders(),
  });
  return handle<{ data: DisponibilidadResp }>(res);
}
