export type AulaEstado = "activo" | "inactivo" | "mantenimiento";
export type AulaTipo = "teoria" | "laboratorio" | "auditorio";

export interface AulaDTO {
  id_aula: number;
  numero: string;
  tipo: AulaTipo | string;
  capacidad: number;
  piso: number | null;
  estado: AulaEstado;
}

export interface Aula {
  id: number;
  numero: string;
  tipo: AulaTipo | string;
  capacidad: number;
  piso: number | null;
  estado: AulaEstado;
}

export const dtoToModel = (r: AulaDTO): Aula => ({
  id: r.id_aula,
  numero: r.numero,
  tipo: r.tipo,
  capacidad: r.capacidad,
  piso: r.piso,
  estado: r.estado,
});
