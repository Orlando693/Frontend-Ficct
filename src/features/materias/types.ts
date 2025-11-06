export type MateriaEstado = "ACTIVA" | "INACTIVA";

export interface MateriaDTO {
  id_materia: number;
  codigo: string;
  nombre: string;
  creditos: number;
  estado: MateriaEstado;
}

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  estado: MateriaEstado;
}

export const dtoToModel = (r: MateriaDTO): Materia => ({
  id: r.id_materia,
  codigo: r.codigo,
  nombre: r.nombre,
  creditos: r.creditos,
  estado: r.estado,
});
