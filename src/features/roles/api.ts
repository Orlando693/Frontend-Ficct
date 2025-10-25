import type { Rol, Modulo, PermSet } from "./types"
import * as userApi from "../usuarios/api"

const KEY = "demo_roles"

const MODULOS: Modulo[] = [
  "Usuarios",
  "Materias",
  "Grupos",
  "Aulas",
  "Programacion",
  "Asistencia",
  "Reportes",
]

function basePerms(all = false): Record<Modulo, PermSet> {
  const p = { ver: all, crear: all, editar: all, eliminar: all }
  return MODULOS.reduce((acc, m) => ({ ...acc, [m]: { ...p } }), {} as Record<Modulo, PermSet>)
}

function seed(): Rol[] {
  const r: Rol[] = [
    {
      id: 1,
      nombre: "CPD",
      descripcion: "Administrador de la Facultad",
      estado: "ACTIVO",
      permisos: basePerms(true),
    },
    {
      id: 2,
      nombre: "Decanato",
      descripcion: "Autoridad académica",
      estado: "ACTIVO",
      permisos: {
        ...basePerms(false),
        Usuarios: { ver: true, crear: false, editar: false, eliminar: false },
        Materias: { ver: true, crear: true, editar: true, eliminar: false },
        Reportes: { ver: true, crear: false, editar: false, eliminar: false },
      },
    },
    {
      id: 3,
      nombre: "Jefatura",
      descripcion: "Jefatura de carrera",
      estado: "ACTIVO",
      permisos: {
        ...basePerms(false),
        Usuarios: { ver: true, crear: false, editar: false, eliminar: false },
        Programacion: { ver: true, crear: true, editar: true, eliminar: false },
        Asistencia: { ver: true, crear: false, editar: false, eliminar: false },
      },
    },
    {
      id: 4,
      nombre: "Docente",
      descripcion: "Docente de la FICCT",
      estado: "ACTIVO",
      permisos: {
        ...basePerms(false),
        Programacion: { ver: true, crear: false, editar: false, eliminar: false },
        Asistencia: { ver: true, crear: true, editar: true, eliminar: false },
        Reportes: { ver: true, crear: false, editar: false, eliminar: false },
      },
    },
  ]
  localStorage.setItem(KEY, JSON.stringify(r))
  return r
}

function read(): Rol[] {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Rol[]) : seed()
}
function write(list: Rol[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export async function list(): Promise<Rol[]> {
  return read()
}

export async function create(payload: Omit<Rol, "id">): Promise<Rol> {
  const list = read()
  if (list.some((x) => x.nombre.trim().toLowerCase() === payload.nombre.trim().toLowerCase())) {
    throw new Error("Nombre de rol duplicado.")
  }
  const id = Math.max(0, ...list.map((x) => x.id)) + 1
  const nuevo: Rol = { id, ...payload }
  write([...list, nuevo])
  return nuevo
}

export async function update(id: number, patch: Partial<Rol>): Promise<Rol> {
  const list = read()
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) throw new Error("Rol no encontrado.")
  const target = { ...list[i], ...patch }
  // Duplicado
  if (
    list.some(
      (x) =>
        x.id !== id &&
        x.nombre.trim().toLowerCase() === target.nombre.trim().toLowerCase()
    )
  ) {
    throw new Error("Nombre de rol duplicado.")
  }
  list[i] = target
  write(list)
  return target
}

export async function remove(id: number) {
  const list = read()
  const r = list.find((x) => x.id === id)
  if (!r) return
  // Reglas: no borrar si está asignado a usuarios
  const users = await userApi.list()
  if (users.some((u) => (u.rol || "").toLowerCase() === r.nombre.toLowerCase())) {
    throw new Error("No se puede eliminar: el rol está asignado a uno o más usuarios.")
  }
  write(list.filter((x) => x.id !== id))
}

export const modules = () => MODULOS
export const defaultPerms = () => basePerms(false)
