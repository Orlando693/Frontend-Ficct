import type { LogEvent, ResultadoLog } from "./types"

const KEY = "logs"

function seed(): LogEvent[] {
  const now = Date.now()
  const base: LogEvent[] = [
    {
      id: 1,
      at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      usuario: "cpd@ficct.edu.bo",
      actor: "CPD",
      modulo: "Usuarios",
      accion: "crear",
      entidad: "Usuario:jlopez",
      resultado: "OK",
      ip: "10.0.0.1",
      detalle: "Alta de usuario docente",
    },
    {
      id: 2,
      at: new Date(now - 1000 * 60 * 60 * 23).toISOString(),
      usuario: "cpd@ficct.edu.bo",
      actor: "CPD",
      modulo: "Carreras",
      accion: "editar",
      entidad: "Carrera:SIS",
      resultado: "OK",
      ip: "10.0.0.1",
      detalle: "Cambio de nombre visible",
    },
    {
      id: 3,
      at: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      usuario: "decanato@ficct.edu.bo",
      actor: "Decanato",
      modulo: "Reportes",
      accion: "export_pdf",
      entidad: "CargaHoraria",
      resultado: "OK",
      ip: "10.0.0.10",
      detalle: "Exportó a PDF",
      filtros: { gestion: "2024-2", carrera: "Sistemas" },
    },
    {
      id: 4,
      at: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      usuario: "jrojas@ficct.edu.bo",
      actor: "CPD",
      modulo: "Usuarios",
      accion: "bloquear",
      entidad: "Usuario:agonzalez",
      resultado: "OK",
      ip: "10.0.0.1",
      detalle: "Exceso de intentos",
    },
    {
      id: 5,
      at: new Date(now - 1000 * 60 * 60 * 16).toISOString(),
      usuario: "jefatura@ficct.edu.bo",
      actor: "Jefatura",
      modulo: "Reportes",
      accion: "export_csv",
      entidad: "Asistencia",
      resultado: "ERROR",
      ip: "10.0.0.15",
      detalle: "Timeout al generar (prueba)",
      filtros: { desde: "2024-08-01", hasta: "2024-08-31" },
    },
  ]
  localStorage.setItem(KEY, JSON.stringify(base))
  return base
}

function read(): LogEvent[] {
  const raw = localStorage.getItem(KEY)
  const list: LogEvent[] = raw ? JSON.parse(raw) : seed()
  // ordenamos DESC por fecha
  return list.sort((a, b) => +new Date(b.at) - +new Date(a.at))
}

export async function list(): Promise<LogEvent[]> {
  return read()
}

// util opcional para registrar desde otras pantallas
export async function append(e: Omit<LogEvent, "id">) {
  const list = read()
  const id = Math.max(0, ...list.map(x => x.id)) + 1
  const ev: LogEvent = { id, ...e }
  localStorage.setItem(KEY, JSON.stringify([ev, ...list]))
}

export function toCSV(rows: LogEvent[]): string {
  const head = ["Fecha/Hora","Usuario","Actor","Módulo","Acción","Entidad","Resultado","IP","Detalle"]
  const body = rows.map(r =>
    [
      new Date(r.at).toLocaleString(),
      r.usuario || "",
      r.actor || "",
      r.modulo,
      r.accion,
      r.entidad || "",
      r.resultado,
      r.ip || "",
      (r.detalle || "").replace(/\n/g, " "),
    ].join(",")
  )
  return [head.join(","), ...body].join("\n")
}
