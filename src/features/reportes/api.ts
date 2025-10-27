// API del módulo Reportes
import { apiFetch } from "../../lib/api";
import type { DocenteItem, Filtros, Row } from "./types";

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

export default { listDocentes, generarReportes };
