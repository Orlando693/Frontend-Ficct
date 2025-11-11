import { apiFetch } from "../../lib/api";
import type {
  Carrera,
  CreateCarreraDTO,
  UpdateCarreraDTO,
  EstadoCarrera,
} from "./types";

// ---- Helpers de normalización ----
function pick<T>(obj: any, path: string, fallback: T): T {
  try {
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) cur = cur?.[p];
    return (cur ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function toOne(raw: any): Carrera {
  // Soportar keys alternativas provenientes del backend
  const id = raw?.id ?? raw?.carrera_id ?? raw?.uuid ?? raw?.ID ?? String(Math.random());
  const nombre = raw?.nombre ?? raw?.name ?? "";
  const sigla = (raw?.sigla ?? raw?.code ?? "").toString().toUpperCase();
  const estado: EstadoCarrera =
    ((raw?.estado ?? raw?.status ?? "ACTIVA") as string).toUpperCase() === "INACTIVA"
      ? "INACTIVA"
      : "ACTIVA";

  // Contadores (pueden venir en varios campos o no venir)
  const materiasAsociadas =
    Number(
      raw?.materiasAsociadas ??
        raw?.materias_asociadas ??
        raw?.materias_count ??
        raw?._materias ??
        0
    ) || 0;

  const gruposAsociados =
    Number(
      raw?.gruposAsociados ??
        raw?.grupos_asociados ??
        raw?.grupos_count ??
        raw?._grupos ??
        0
    ) || 0;

  return { id, nombre, sigla, estado, materiasAsociadas, gruposAsociados };
}

function toMany(payload: any): Carrera[] {
  // Acepta: {data:[...]}, [...], {items:[...]}, {carreras:[...]}
  const arr: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.carreras)
    ? payload.carreras
    : [];
  return arr.map(toOne);
}

// ===============================================================
//                      ENDPOINTS PÚBLICOS
// ===============================================================

/**
 * GET /api/carreras
 * Opcionalmente si tu backend soporta estadísticas:
 *   /api/carreras?with=count
 */
export async function list(): Promise<Carrera[]> {
  // intenta con stats; si no existe, cae al plano normal
  try {
    const j = await apiFetch("/carreras?with=count");
    const rows = toMany(j);
    if (rows.length) return rows;
  } catch {
    /* fallback */
  }
  const j2 = await apiFetch("/carreras");
  return toMany(j2);
}

/** POST /api/carreras  */
export async function create(payload: CreateCarreraDTO): Promise<Carrera> {
  const j = await apiFetch("/carreras", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // el backend puede responder {data: {...}} o {...}
  const raw = pick<any>(j, "data", j);
  const row = toOne(raw);
  // si el backend no calcula contadores al crear, los iniciamos en 0
  row.materiasAsociadas ||= 0;
  row.gruposAsociados ||= 0;
  return row;
}

/** PUT /api/carreras/{id}  */
export async function update(id: number | string, payload: UpdateCarreraDTO): Promise<Carrera> {
  const j = await apiFetch(`/carreras/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const raw = pick<any>(j, "data", j);
  return toOne(raw);
}

/** PATCH /api/carreras/{id}/estado */
export async function setEstado(id: number | string, estado: EstadoCarrera): Promise<Carrera> {
  // si tu backend lo maneja como PUT /carreras/{id}, funcionar á igual
  try {
    const j = await apiFetch(`/carreras/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    const raw = pick<any>(j, "data", j);
    return toOne(raw);
  } catch {
    // fallback a update completo
    return update(id, { estado });
  }
}
/** DELETE /api/carreras/{id} */
export async function remove(id: number | string): Promise<void> {
  await apiFetch(/carreras/, { method: "DELETE" });
}
