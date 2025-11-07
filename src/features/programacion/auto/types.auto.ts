export type AutoStatus = "ok" | "pendiente" | "conflicto";

export interface AutoRow {
  grupo_id: number;
  grupo_label: string; // ej: "INF-121 · Programación I · A"
  // sugerencia solo si status = "ok"
  sugerido?: {
    aula_id: number;
    aula_label: string; // ej: "A-101 (60)"
    dia_semana: number; // 1..7
    hora_inicio: string; // "HH:MM"
    hora_fin: string;    // "HH:MM"
  } | null;
  status: AutoStatus;
  detalle?: string; // explicación de conflicto/pedido pendiente
}

export interface AutoSummary {
  total: number;
  ok: number;
  pendientes: number;
  conflictos: number;
}
