// API del módulo Reportes
import { apiFetch } from "../../lib/api";
import type { DocenteItem, Filtros, Row } from "./types";

function pickArray(payload: any): any[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function uniqStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

// Normaliza diferentes shapes de respuesta a un array de docentes [{id, nombre}]
function toDocentesList(payload: any): DocenteItem[] {
  const arr = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.users)
        ? payload.users
        : [];

  return arr
    .map((d: any) => ({
      id: d.id ?? d.user_id ?? d.uuid ?? d.nombre ?? d.name ?? String(Math.random()),
      nombre: d.nombre ?? d.name ?? "",
      rol: d.rol ?? d.role ?? "",
      estado: d.estado ?? d.status ?? "",
    }))
    .filter((d: any) => d.nombre && (d.rol?.toString().toLowerCase() === "docente"));
}

export async function listDocentes(): Promise<DocenteItem[]> {
  // 1) Intentar endpoint dedicado (si lo creaste)
  try {
    const j = await apiFetch("/reportes/docentes");
    const list = toDocentesList(j);
    if (list.length) return list;
  } catch { /* ignorar y hacer fallback */ }

  // 2) Fallback a /users con filtros
  try {
    const j2 = await apiFetch("/users?rol=Docente&estado=ACTIVO");
    const list = toDocentesList(j2);
    return list;
  } catch (e) {
    console.error("listDocentes fallback error:", e);
    return [];
  }
}

export async function generarReportes(filtros: Filtros): Promise<Row[]> {
  const j = await apiFetch("/reportes/generar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtros),
  });
  return Array.isArray(j?.data) ? j.data : [];
}

export async function listGestionesCatalog(): Promise<string[]> {
  try {
    const json = await apiFetch("/gestiones");
    const rows = pickArray(json);
    return uniqStrings(
      rows.map((g: any) => g.label ?? (g.anio && g.periodo ? `${g.anio}-${g.periodo}` : null)),
    );
  } catch (err) {
    console.error("listGestionesCatalog failed", err);
    return [];
  }
}

export async function listCarrerasCatalog(): Promise<string[]> {
  try {
    const json = await apiFetch("/carreras?estado=ACTIVA");
    const rows = pickArray(json);
    return uniqStrings(
      rows.map((c: any) => {
        if (c.sigla && c.nombre) return `${c.sigla} · ${c.nombre}`;
        return c.nombre ?? c.sigla ?? null;
      }),
    );
  } catch (err) {
    console.error("listCarrerasCatalog failed", err);
    return [];
  }
}

export async function listMateriasCatalog(): Promise<string[]> {
  try {
    const json = await apiFetch("/materias/mini");
    const rows = pickArray(json);
    return uniqStrings(
      rows.map((m: any) => {
        if (m.codigo && m.nombre) return `${m.codigo} · ${m.nombre}`;
        return m.nombre ?? m.codigo ?? null;
      }),
    );
  } catch (err) {
    console.error("listMateriasCatalog failed", err);
    return [];
  }
}

export async function listGruposCatalog(gestion?: string | number): Promise<string[]> {
  try {
    const params = new URLSearchParams();
    if (gestion) params.set("gestion_id", String(gestion));
    params.set("limit", "200");
    const path = params.size ? `/grupos?${params.toString()}` : "/grupos";
    const json = await apiFetch(path);
    const rows = pickArray(json);
    return uniqStrings(
      rows.map((g: any) => {
        const materia =
          g.materia_label ??
          g.materia_nombre ??
          g.materia ??
          g.materia_codigo ??
          "";
        const paralelo = g.paralelo ?? g.nombre ?? "";
        const gestionLabel =
          g.anio && g.periodo ? ` (${g.anio}-${g.periodo})` : "";
        const base = [materia, paralelo].filter(Boolean).join(" · ");
        return base ? `${base}${gestionLabel}` : paralelo || null;
      }),
    );
  } catch (err) {
    console.error("listGruposCatalog failed", err);
    return [];
  }
}

export async function listAulasCatalog(): Promise<string[]> {
  try {
    const json = await apiFetch("/aulas?estado=ACTIVA&per_page=200");
    const rows = pickArray(json);
    return uniqStrings(
      rows.map((a: any) => a.numero ?? a.codigo ?? a.nombre ?? null),
    );
  } catch (err) {
    console.error("listAulasCatalog failed", err);
    return [];
  }
}

export default {
  listDocentes,
  generarReportes,
  listGestionesCatalog,
  listCarrerasCatalog,
  listMateriasCatalog,
  listGruposCatalog,
  listAulasCatalog,
};
