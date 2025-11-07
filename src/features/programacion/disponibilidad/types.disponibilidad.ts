export interface FiltrosDisp {
  gestion_id: number | "";
  dia_semana: number | "";
  hora_inicio: string;
  hora_fin: string;
  min_capacidad: number | "";
  tipo: string; // libre (teoria | laboratorio | auditorio | ...)
}
