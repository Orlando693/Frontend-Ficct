// Reutilizamos la misma idea de DTOs
export type Turno = "manana" | "tarde" | "noche";

export interface GrupoMiniDTO {
  id_grupo: number;
  gestion_id: number;
  paralelo: string;
  turno: Turno;
  capacidad: number;
  materia_label: string;   // ej: "INF-121 · Programación I"
}

export interface AulaMiniDTO {
  id_aula: number;
  numero: string;
  tipo: string;
  capacidad: number;
  piso?: number | null;
  estado: "activo" | "inactivo" | "mantenimiento";
}

export interface HorarioDTO {
  id_horario: number;
  grupo_id: number;
  aula_id: number;
  dia_semana: number;      // 1..7
  hora_inicio: string;     // "HH:MM"
  hora_fin: string;        // "HH:MM"
  aula_label?: string;     // ej "A-101 (60)"
  grupo_label?: string;    // ej "INF-121 · Prog I (A)"
}

export interface Conflicto {
  tipo: "AULA" | "DOCENTE" | "GRUPO";
  detalle: string;
}

export interface DisponibilidadResp {
  disponibles: AulaMiniDTO[];
  conflictos: Conflicto[]; // si hay choques detectados
}
