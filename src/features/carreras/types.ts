// Tipos para el feature Carreras

export type EstadoCarrera = "ACTIVA" | "INACTIVA";

export interface Carrera {
  id: number | string;
  nombre: string;
  sigla: string; // ej: SIS, INF, IND
  estado: EstadoCarrera;

  // Estos dos los mostramos en la tabla
  materiasAsociadas: number;
  gruposAsociados: number;
}

// Payloads de creación/edición
export type CreateCarreraDTO = {
  nombre: string;
  sigla: string;
  estado: EstadoCarrera;
};

export type UpdateCarreraDTO = Partial<CreateCarreraDTO> & { id?: number | string };
