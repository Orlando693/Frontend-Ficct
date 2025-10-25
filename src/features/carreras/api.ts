import type { Carrera, EstadoCarrera } from "./types"

const KEY = "demo_carreras"

function seed(): Carrera[] {
  const init: Carrera[] = [
    { id: 1, nombre: "Ingeniería de Sistemas",     sigla: "SIS", estado: "ACTIVA",   materiasAsociadas: 24, gruposAsociados: 18 },
    { id: 2, nombre: "Ingeniería Informática",     sigla: "INF", estado: "ACTIVA",   materiasAsociadas: 20, gruposAsociados: 15 },
    { id: 3, nombre: "Ingeniería Industrial",      sigla: "IND", estado: "INACTIVA", materiasAsociadas:  8, gruposAsociados:  6 },
  ]
  localStorage.setItem(KEY, JSON.stringify(init))
  return init
}

function read(): Carrera[] {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Carrera[]) : seed()
}
function write(list: Carrera[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function logBitacora(evento: any) {
  const logs = JSON.parse(localStorage.getItem("logs") || "[]")
  logs.push({ at: new Date().toISOString(), ...evento })
  localStorage.setItem("logs", JSON.stringify(logs))
}

export async function list(): Promise<Carrera[]> { return read() }

export async function create(payload: Omit<Carrera, "id" | "materiasAsociadas" | "gruposAsociados">): Promise<Carrera> {
  const list = read()
  const sig = payload.sigla.trim().toUpperCase()
  if (!payload.nombre.trim()) throw new Error("El nombre es obligatorio.")
  if (!sig) throw new Error("La sigla es obligatoria.")
  if (list.some(c => c.sigla.toUpperCase() === sig)) throw new Error("La sigla ya existe.")

  const id = Math.max(0, ...list.map(c => c.id)) + 1
  const nueva: Carrera = { id, nombre: payload.nombre.trim(), sigla: sig, estado: payload.estado, materiasAsociadas: 0, gruposAsociados: 0 }
  write([...list, nueva])
  logBitacora({ modulo: "Carreras", accion: "crear", carrera: nueva.sigla })
  return nueva
}

export async function update(id: number, patch: Partial<Carrera>): Promise<Carrera> {
  const list = read()
  const i = list.findIndex(c => c.id === id)
  if (i < 0) throw new Error("Carrera no encontrada.")

  const nextSigla = (patch.sigla ?? list[i].sigla).trim().toUpperCase()
  const nextNombre = (patch.nombre ?? list[i].nombre).trim()
  if (!nextNombre) throw new Error("El nombre es obligatorio.")
  if (!nextSigla) throw new Error("La sigla es obligatoria.")
  if (list.some(c => c.id !== id && c.sigla.toUpperCase() === nextSigla)) throw new Error("La sigla ya existe.")

  const upd: Carrera = { ...list[i], ...patch, sigla: nextSigla, nombre: nextNombre }
  list[i] = upd
  write(list)
  logBitacora({ modulo: "Carreras", accion: "editar", carrera: upd.sigla })
  return upd
}

export async function setEstado(id: number, estado: EstadoCarrera): Promise<Carrera> {
  const list = read()
  const i = list.findIndex(c => c.id === id)
  if (i < 0) throw new Error("Carrera no encontrada.")
  list[i] = { ...list[i], estado }
  write(list)
  logBitacora({ modulo: "Carreras", accion: "estado", carrera: list[i].sigla, estado })
  return list[i]
}

// Si quisieras permitir eliminar (NO recomendado por CU7):
export async function remove(id: number) {
  const list = read()
  const c = list.find(x => x.id === id)
  if (!c) return
  if (c.materiasAsociadas > 0 || c.gruposAsociados > 0)
    throw new Error("No se puede eliminar: tiene materias/grupos asociados. Inactiva la carrera.")
  write(list.filter(x => x.id !== id))
  logBitacora({ modulo: "Carreras", accion: "eliminar", carrera: c.sigla })
}
