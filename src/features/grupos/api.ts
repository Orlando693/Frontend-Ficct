import { apiFetch } from "../../lib/api";
import type {
  GestionDTO,
  Grupo,
  GrupoDTO,
  GrupoEstado,
  MateriaMiniDTO,
  Turno,
} from "./types";
import { dtoToModel } from "./types";

function pickData<T = any>(payload: any): T[] {
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload)) return payload as T[];
  return [];
}

function fallbackGestiones(): GestionDTO[] {
  const rows: GestionDTO[] = [];
  for (let year = 2024; year <= 2026; year++) {
    for (const periodo of [1, 2]) {
      rows.push({
        id_gestion: Number(`${year}${periodo}`),
        anio: year,
        periodo,
      });
    }
  }
  return rows;
}

export async function listGestiones(): Promise<GestionDTO[]> {
  const json = await apiFetch("/gestiones");
  const data = pickData<GestionDTO>(json);
  if (data.length) return data;
  return fallbackGestiones();
}

export async function listMateriasActivas(): Promise<MateriaMiniDTO[]> {
  const json = await apiFetch("/materias?estado=ACTIVA&per_page=200");
  const rows = pickData<any>(json);
  return rows.map((m) => ({
    id_materia: m.id_materia ?? m.id ?? m.materia_id,
    codigo: m.codigo ?? m.materia_codigo ?? "",
    nombre: m.nombre ?? m.materia_nombre ?? "",
  }));
}

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

  const json = await apiFetch(`/grupos${qs.toString() ? `?${qs.toString()}` : ""}`);
  const rows = pickData<GrupoDTO>(json);
  return { data: rows.map(dtoToModel) as Grupo[] };
}

export async function createGrupo(payload: {
  gestion_id: number;
  materia_id: number;
  paralelo: string;
  turno: Turno;
  capacidad: number;
}) {
  const json = await apiFetch("/grupos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { data: dtoToModel(json.data as GrupoDTO) };
}

export async function updateGrupo(
  id: number,
  payload: {
    gestion_id: number;
    materia_id: number;
    paralelo: string;
    turno: Turno;
    capacidad: number;
  },
) {
  const json = await apiFetch(`/grupos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return { data: dtoToModel(json.data as GrupoDTO) };
}

export async function setEstadoGrupo(id: number, estado: GrupoEstado) {
  const json = await apiFetch(`/grupos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
  return { data: dtoToModel(json.data as GrupoDTO) };
}

export async function deleteGrupo(id: number) {
  return apiFetch(`/grupos/${id}`, { method: "DELETE" });
}
