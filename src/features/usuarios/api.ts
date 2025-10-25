import type { Usuario } from "./types"

const KEY = "demo_users"

function read(): Usuario[] {
  const raw = localStorage.getItem(KEY)
  if (raw) return JSON.parse(raw)
  // datos demo
  const demo: Usuario[] = [
    { id: 1, nombre: "Juan Pérez", username: "jperez", correo: "jperez@ficct.edu.bo", rol: "Docente", estado: "PENDIENTE", conHorarios: false },
    { id: 2, nombre: "María Gómez", username: "mgomez", correo: "mgomez@ficct.edu.bo", rol: "CPD", estado: "ACTIVO" },
    { id: 3, nombre: "Luis Rojas", username: "lrojas", correo: "lrojas@ficct.edu.bo", rol: "Jefatura", estado: "ACTIVO" },
    { id: 4, nombre: "Ana Torres", username: "atorres", correo: "atorres@ficct.edu.bo", rol: "Docente", estado: "PENDIENTE", conHorarios: true },
    { id: 5, nombre: "Decana Flores", username: "dflores", correo: "dflores@ficct.edu.bo", rol: "Decanato", estado: "ACTIVO" },
  ]
  localStorage.setItem(KEY, JSON.stringify(demo))
  return demo
}
function write(list: Usuario[]) { localStorage.setItem(KEY, JSON.stringify(list)) }

export async function list(): Promise<Usuario[]> {
  return read()
}

export async function create(u: Omit<Usuario, "id">): Promise<Usuario> {
  const list = read()
  // unicidad por correo o username
  if (list.some(x => x.correo === u.correo || (u.username && x.username === u.username))) {
    throw new Error("Correo o usuario ya existe.")
  }
  const id = Math.max(0, ...list.map(x => x.id)) + 1
  const nuevo: Usuario = { id, ...u }
  write([nuevo, ...list])
  return nuevo
}

export async function update(id: number, patch: Partial<Usuario>): Promise<Usuario> {
  const list = read()
  const i = list.findIndex(x => x.id === id)
  if (i < 0) throw new Error("No encontrado.")
  // unicidad si cambia correo/username
  const target = { ...list[i], ...patch }
  if (list.some(x => x.id !== id && (x.correo === target.correo || (target.username && x.username === target.username)))) {
    throw new Error("Correo o usuario ya existe.")
  }
  list[i] = target
  write(list)
  return target
}

export async function setEstado(id: number, estado: Usuario["estado"]) {
  return update(id, { estado })
}

export async function remove(id: number): Promise<void> {
  const list = read()
  const u = list.find(x => x.id === id)
  if (!u) return
  // Regla del enunciado: si tiene dependencias críticas (docente con horarios),
  // en lugar de eliminar, se bloquea
  if (u.rol === "Docente" && u.conHorarios) {
    const i = list.findIndex(x => x.id === id)
    list[i] = { ...u, estado: "BLOQUEADO" }
    write(list)
    throw new Error("El docente tiene horarios publicados: se bloqueó la cuenta en lugar de eliminar.")
  }
  write(list.filter(x => x.id !== id))
}

export async function resetPassword(id: number) {
  // Stub: en backend enviarás correo o marcarás flag "must_change_password"
  return { ok: true }
}
