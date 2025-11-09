import { apiFetch } from "../../lib/api";
import type { Aula, AulaDTO, AulaEstado, AulaTipo } from "./types";
import { dtoToModel } from "./types";

function pickMany<T = AulaDTO>(payload: any): T[] {
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload)) return payload as T[];
  return [];
}

function pickOne(payload: any): AulaDTO {
  return (payload?.data as AulaDTO) ?? (payload as AulaDTO);
}

export async function listAulas(params?: {
  q?: string;
  estado?: "todas" | AulaEstado;
  tipo?: "todos" | AulaTipo;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todas") qs.set("estado", params.estado);
  if (params?.tipo && params.tipo !== "todos") qs.set("tipo", params.tipo);

  const json = await apiFetch(`/aulas${qs.toString() ? `?${qs.toString()}` : ""}`);
  const rows = pickMany<AulaDTO>(json);
  return { data: rows.map(dtoToModel) as Aula[] };
}

function toBackendTipo(tipo: string) {
  return tipo.toUpperCase();
}

export async function createAula(payload: {
  numero: string;
  tipo: AulaTipo;
  capacidad: number;
  piso?: number | null;
}) {
  const json = await apiFetch("/aulas", {
    method: "POST",
    body: JSON.stringify({
      codigo: payload.numero,
      tipo: toBackendTipo(payload.tipo),
      capacidad: payload.capacidad,
      piso: payload.piso,
    }),
  });
  return { data: dtoToModel(pickOne(json)) };
}

export async function updateAula(
  id: number,
  payload: {
    numero: string;
    tipo: AulaTipo;
    capacidad: number;
    piso?: number | null;
  },
) {
  const json = await apiFetch(`/aulas/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      codigo: payload.numero,
      tipo: toBackendTipo(payload.tipo),
      capacidad: payload.capacidad,
      piso: payload.piso,
    }),
  });
  return { data: dtoToModel(pickOne(json)) };
}

export async function setEstadoAula(id: number, estado: AulaEstado) {
  const mapped =
    estado === "activo" ? "ACTIVO" : estado === "inactivo" ? "INACTIVO" : estado.toUpperCase();
  const json = await apiFetch(`/aulas/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado: mapped }),
  });
  return { data: dtoToModel(pickOne(json)) };
}
