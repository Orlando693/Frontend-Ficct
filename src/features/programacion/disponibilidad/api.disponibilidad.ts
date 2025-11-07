import type { AulaMiniDTO } from "../types";

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

/**
 * Busca aulas disponibles para un rango de día/hora con filtros opcionales.
 * Intenta usar /aulas/disponibles (GET) y adapta el payload que responda tu backend.
 */
export async function searchDisponibilidad(params: {
  gestion_id: number;
  dia_semana: number;
  hora_inicio: string;     // "HH:MM"
  hora_fin: string;        // "HH:MM"
  min_capacidad?: number;
  tipo?: string;           // "teoria" | "laboratorio" | etc.
}) {
  const q = new URLSearchParams();
  q.set("gestion_id", String(params.gestion_id));
  q.set("dia_semana", String(params.dia_semana));
  q.set("hora_inicio", params.hora_inicio);
  q.set("hora_fin", params.hora_fin);
  if (params.min_capacidad) q.set("min_capacidad", String(params.min_capacidad));
  if (params.tipo) q.set("tipo", params.tipo);

  const res = await fetch(`${API}/aulas/disponibles?${q.toString()}`, {
    headers: authHeaders()
  });

  // Soporta dos posibles formatos:
  // 1) { data: { disponibles: AulaMiniDTO[] } }
  // 2) { data: AulaMiniDTO[] }
  const payload = await handle<any>(res);
  const aulas: AulaMiniDTO[] =
    payload?.data?.disponibles ?? payload?.data ?? [];
  return { data: aulas as AulaMiniDTO[] };
}
