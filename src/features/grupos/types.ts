export type Turno = "manana" | "tarde" | "noche";
export type GrupoEstado = "ACTIVO" | "INACTIVO";

export interface GestionDTO {
  id_gestion: number;
  anio: number;
  periodo: number;
}
export interface MateriaMiniDTO {
  id_materia: number;
  codigo: string;
  nombre: string;
}

export interface GrupoDTO {
  id_grupo: number;
  gestion_id: number;
  anio: number;
  periodo: number;
  materia_id: number;
  materia_codigo: string;
  materia_nombre: string;
  paralelo: string;
  turno: Turno;
  capacidad: number;
  estado: GrupoEstado;
}

export interface Grupo {
  id: number;
  gestion_id: number;
  gestion_label: string;            // "2025-1"
  materia_id: number;
  materia_label: string;            // "INF-121 · Programación I"
  paralelo: string;
  turno: Turno;
  capacidad: number;
  estado: GrupoEstado;
}

export const dtoToModel = (r: GrupoDTO): Grupo => ({
  id: r.id_grupo,
  gestion_id: r.gestion_id,
  gestion_label: `${r.anio}-${r.periodo}`,
  materia_id: r.materia_id,
  materia_label: `${r.materia_codigo} · ${r.materia_nombre}`,
  paralelo: r.paralelo,
  turno: r.turno,
  capacidad: r.capacidad,
  estado: r.estado,
});
