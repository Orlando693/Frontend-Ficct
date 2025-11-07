// ---- Turnos / Parámetros globales ----
export type TurnoKey = "manana" | "tarde" | "noche";

export interface TurnoCfg {
  turno: TurnoKey;
  inicio: string; // "HH:MM"
  fin: string;    // "HH:MM"
}

export interface ParametrosDTO {
  duracion_bloque_min: number;
  dias_habiles: number[]; // 1..7 (1=lunes)
  turnos: TurnoCfg[];
}

// ---- Gestiones (periodos académicos) ----
export interface GestionDTO {
  id_gestion: number;
  anio: number;
  periodo: number;
  fecha_ini: string; // "YYYY-MM-DD"
  fecha_fin: string; // "YYYY-MM-DD"
}

export interface Gestion {
  id: number;
  anio: number;
  periodo: number;
  fecha_ini: string;
  fecha_fin: string;
  label: string; // "2025-1"
}

export const dtoToGestion = (g: GestionDTO): Gestion => ({
  id: g.id_gestion,
  anio: g.anio,
  periodo: g.periodo,
  fecha_ini: g.fecha_ini,
  fecha_fin: g.fecha_fin,
  label: `${g.anio}-${g.periodo}`,
});

// ---- Carreras y Materias (mini) ----
export interface CarreraMiniDTO {
  id_carrera: number;
  nombre: string;
  sigla: string;
  estado: "ACTIVA" | "INACTIVA";
}

export interface MateriaMiniDTO {
  id_materia: number;
  codigo: string;
  nombre: string;
  creditos: number;
  estado: "ACTIVA" | "INACTIVA";
}

// ---- Asociación materia_carrera (plan de estudios) ----
export interface PlanDTO {
  id_materia_carrera: number;
  carrera_id: number;
  materia_id: number;
  plan: number;
  semestre: number;       // 1..12
  tipo: string;           // "obligatoria" | "electiva" | etc.
  carga_teo: number;
  carga_pra: number;
}

export interface PlanRecord {
  id: number;
  carrera_id: number;
  materia_id: number;
  plan: number;
  semestre: number;
  tipo: string;
  carga_teo: number;
  carga_pra: number;
  materia_label: string; // "INF-121 · Programación I"
}

export const dtoToPlan = (p: PlanDTO, materia?: MateriaMiniDTO): PlanRecord => ({
  id: p.id_materia_carrera,
  carrera_id: p.carrera_id,
  materia_id: p.materia_id,
  plan: p.plan,
  semestre: p.semestre,
  tipo: p.tipo,
  carga_teo: p.carga_teo,
  carga_pra: p.carga_pra,
  materia_label: materia ? `${materia.codigo} · ${materia.nombre}` : `${p.materia_id}`,
});
