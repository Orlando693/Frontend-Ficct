export type EstadoAsistencia = "pendiente" | "presente" | "ausente" | "justificado";

export interface SesionDocenteDTO {
  id_horario: number;
  dia_semana: number;           // 1..7
  fecha: string;                // "YYYY-MM-DD" (servidor puede enviar la del día)
  hora_inicio: string;          // "HH:MM"
  hora_fin: string;             // "HH:MM"
  aula_label: string;           // "A-101 (60)"
  grupo_label: string;          // "INF-121 · A"
  materia_label?: string;       // "Programación I"
  estado?: EstadoAsistencia;    // si ya está marcada
}
