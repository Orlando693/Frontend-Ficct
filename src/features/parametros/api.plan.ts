import type { CarreraMiniDTO, MateriaMiniDTO, PlanDTO } from "./types";

const API = import.meta.env.VITE_API_URL;

function authHeaders(extra: Record<string, string> = {}) {
  const h: Record<string,string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let j:any=null; try{ j=await res.json(); } catch {}
  throw new Error(j?.message || res.statusText);
}

// Listar catálogos activos
export async function listCarrerasActivas() {
  const res = await fetch(`${API}/carreras?estado=ACTIVA`, { headers: authHeaders() });
  return handle<{ data: CarreraMiniDTO[] }>(res);
}
export async function listMateriasActivas() {
  const res = await fetch(`${API}/materias?estado=ACTIVA`, { headers: authHeaders() });
  return handle<{ data: MateriaMiniDTO[] }>(res);
}

// Listar asociaciones por carrera
export async function listPlanByCarrera(carrera_id: number) {
  const res = await fetch(`${API}/plan-estudios?carrera_id=${carrera_id}`, { headers: authHeaders() });
  return handle<{ data: PlanDTO[] }>(res);
}

// Crear asociación
export async function createPlan(p: {
  carrera_id: number; materia_id: number; plan: number; semestre: number;
  tipo: string; carga_teo: number; carga_pra: number;
}) {
  const res = await fetch(`${API}/plan-estudios`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(p),
  });
  return handle<{ data: PlanDTO }>(res);
}

// Eliminar asociación (si no tiene grupos)
export async function deletePlan(id_materia_carrera: number) {
  const res = await fetch(`${API}/plan-estudios/${id_materia_carrera}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle<{ ok: boolean }>(res);
}
