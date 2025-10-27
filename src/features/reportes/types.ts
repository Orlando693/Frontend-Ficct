// Tipos del módulo Reportes

export type TipoReporte = "horarios" | "carga" | "asistencia" | "aulas";

export interface Filtros {
  tipo: TipoReporte;
  gestion: string;
  desde?: string;
  hasta?: string;
  carrera?: string;
  materia?: string;
  docente?: string;
  grupo?: string;
  aula?: string;
  turno?: "Mañana" | "Tarde" | "Noche" | "";
}

export type Row =
  | { kind: "horario"; docente: string; materia: string; grupo: string; aula: string; dia: string; hi: string; hf: string }
  | { kind: "carga"; docente: string; carrera: string; horas: number }
  | { kind: "asistencia"; docente: string; grupo: string; fecha: string; presentes: number; total: number }
  | { kind: "aula"; aula: string; dia: string; bloque: string; estado: "OCUPADA" | "DISPONIBLE" };

export interface DocenteItem {
  id: number | string;
  nombre: string;
}
