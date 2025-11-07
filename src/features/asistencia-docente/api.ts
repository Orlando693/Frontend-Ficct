import type { SesionDocenteDTO, EstadoAsistencia } from "./types";

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

// Sesiones del docente para una fecha
export async function listSesionesDocente(fecha: string) {
  const q = new URLSearchParams({ fecha });
  const res = await fetch(`${API}/docente/sesiones?${q.toString()}`, {
    headers: authHeaders(),
  });
  return handle<{ data: SesionDocenteDTO[] }>(res);
}

// Marcar asistencia (Presente/Ausente/Justificado sin archivo)
export async function marcarAsistencia(payload: {
  horario_id: number;
  fecha: string;                    // "YYYY-MM-DD"
  estado: Exclude<EstadoAsistencia, "pendiente">; // "presente" | "ausente" | "justificado"
  justificacion?: string;
}) {
  const res = await fetch(`${API}/docente/asistencia`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handle<{ data: { ok: boolean } }>(res);
}
