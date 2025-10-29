"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { BarChart3, Download, Printer, Search, RefreshCcw } from "lucide-react"
import { listDocentes, generarReportes } from "./api"
import type { DocenteItem, Filtros, Row, TipoReporte } from "./types"

// Catálogos locales (selects)
const carreras = ["Sistemas", "Informática", "Industrial"]
const materias = ["BD I", "Algoritmos", "Ingeniería de SW", "Redes"]
const grupos = ["A-1", "A-2", "B-1", "B-2"]
const aulas = ["A-101", "A-102", "B-201", "B-202"]
const gestiones = ["2024-2", "2024-1", "2023-2"]

// CSV helper
function toCSV(rows: Row[]): string {
  if (!rows.length) return ""
  const headByKind: Record<Row["kind"], string[]> = {
    horario: ["Docente", "Materia", "Grupo", "Aula", "Día", "Inicio", "Fin"],
    carga: ["Docente", "Carrera", "Horas"],
    asistencia: ["Docente", "Grupo", "Fecha", "Presentes", "Total"],
    aula: ["Aula", "Día", "Bloque", "Estado"],
  }
  const kind = rows[0].kind
  const head = headByKind[kind]
  const body = rows.map((r) => {
    if (r.kind === "horario") return [r.docente, r.materia, r.grupo, r.aula, r.dia, r.hi, r.hf].join(",")
    if (r.kind === "carga") return [r.docente, r.carrera, r.horas].join(",")
    if (r.kind === "asistencia") return [r.docente, r.grupo, r.fecha, r.presentes, r.total].join(",")
    return [r.aula, r.dia, r.bloque, r.estado].join(",")
  })
  return [head.join(","), ...body].join("\n")
}

export default function ReportsPage() {
  const [f, setF] = useState<Filtros>({ tipo: "horarios", gestion: "2024-2", turno: "" })
  const [data, setData] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  // Docentes
  const [docentes, setDocentes] = useState<DocenteItem[]>([])
  const [loadingDocentes, setLoadingDocentes] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingDocentes(true)
      try {
        const list = await listDocentes()
        if (mounted) setDocentes(list)
      } catch (e: any) {
        console.error(e)
        if (mounted) setDocentes([])
      } finally {
        if (mounted) setLoadingDocentes(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Métricas simples
  const metrics = useMemo(() => {
    if (!data.length) return { a: 0, b: 0, c: 0, d: 0 }
    if (data[0].kind === "carga") {
      const horas = data.reduce((s, r: any) => s + r.horas, 0)
      return { a: data.length, b: horas, c: 0, d: 0 }
    }
    if (data[0].kind === "asistencia") {
      const sum = data.reduce((s, r: any) => s + r.presentes / r.total, 0)
      const pct = Math.round((sum / data.length) * 100)
      return { a: data.length, b: pct, c: 0, d: 0 }
    }
    if (data[0].kind === "aula") {
      const ocu = data.filter((r: any) => r.estado === "OCUPADA").length
      const pct = Math.round((ocu / data.length) * 100)
      return { a: data.length, b: pct, c: ocu, d: data.length - ocu }
    }
    return { a: data.length, b: 0, c: 0, d: 0 }
  }, [data])

  // Generar
  async function generate() {
    if (!f.gestion) {
      setError("Selecciona una gestión.")
      return
    }
    setError(null)
    try {
      const rows = await generarReportes(f)
      setData(rows)

      // Bitácora (mock local)
      const logs = JSON.parse(localStorage.getItem("logs") || "[]")
      logs.push({ at: new Date().toISOString(), tipo: f.tipo, filtros: f })
      localStorage.setItem("logs", JSON.stringify(logs))
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "No se pudo generar el reporte.")
      setData([])
    }
  }

  function clearAll() {
    setF({ tipo: "horarios", gestion: "2024-2", turno: "" })
    setData([])
    setError(null)
  }

  function exportCSV() {
    if (!data.length) return
    const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_${f.tipo}_${f.gestion}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    window.print()
  }

  // Tabla dinámica
  function TableHead() {
    if (f.tipo === "horarios")
      return (
        <tr>
          <Th>Docente</Th>
          <Th>Materia</Th>
          <Th className="hidden sm:table-cell">Grupo</Th>
          <Th className="hidden md:table-cell">Aula</Th>
          <Th className="hidden lg:table-cell">Día</Th>
          <Th className="hidden lg:table-cell">Inicio</Th>
          <Th className="hidden lg:table-cell">Fin</Th>
        </tr>
      )
    if (f.tipo === "carga")
      return (
        <tr>
          <Th>Docente</Th>
          <Th className="hidden sm:table-cell">Carrera</Th>
          <Th>Horas</Th>
        </tr>
      )
    if (f.tipo === "asistencia")
      return (
        <tr>
          <Th>Docente</Th>
          <Th className="hidden sm:table-cell">Grupo</Th>
          <Th className="hidden md:table-cell">Fecha</Th>
          <Th>Presentes</Th>
          <Th className="hidden sm:table-cell">Total</Th>
          <Th>%</Th>
        </tr>
      )
    return (
      <tr>
        <Th>Aula</Th>
        <Th className="hidden sm:table-cell">Día</Th>
        <Th className="hidden md:table-cell">Bloque</Th>
        <Th>Estado</Th>
      </tr>
    )
  }

  function TableBody() {
    return data.map((r, i) => {
      if (r.kind === "horario")
        return (
          <tr key={i} className="border-b last:border-0">
            <Td>{r.docente}</Td>
            <Td>{r.materia}</Td>
            <Td className="hidden sm:table-cell">{r.grupo}</Td>
            <Td className="hidden md:table-cell">{r.aula}</Td>
            <Td className="hidden lg:table-cell">{r.dia}</Td>
            <Td className="hidden lg:table-cell">{r.hi}</Td>
            <Td className="hidden lg:table-cell">{r.hf}</Td>
          </tr>
        )
      if (r.kind === "carga")
        return (
          <tr key={i} className="border-b last:border-0">
            <Td>{r.docente}</Td>
            <Td className="hidden sm:table-cell">{r.carrera}</Td>
            <Td>{r.horas}</Td>
          </tr>
        )
      if (r.kind === "asistencia") {
        const pct = Math.round((r.presentes / r.total) * 100)
        return (
          <tr key={i} className="border-b last:border-0">
            <Td>{r.docente}</Td>
            <Td className="hidden sm:table-cell">{r.grupo}</Td>
            <Td className="hidden md:table-cell">{r.fecha}</Td>
            <Td>{r.presentes}</Td>
            <Td className="hidden sm:table-cell">{r.total}</Td>
            <Td>
              <Badge pct={pct} />
            </Td>
          </tr>
        )
      }
      return (
        <tr key={i} className="border-b last:border-0">
          <Td>{r.aula}</Td>
          <Td className="hidden sm:table-cell">{r.dia}</Td>
          <Td className="hidden md:table-cell">{r.bloque}</Td>
          <Td>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${r.estado === "OCUPADA" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}
            >
              {r.estado}
            </span>
          </Td>
        </tr>
      )
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-slate-800 p-4 sm:p-0">
      {/* Header - Made responsive with stacked layout on mobile */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-4 sm:p-6 shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs tracking-widest text-slate-300">REPORTES</p>
              <h2 className="text-xl sm:text-2xl font-semibold">Generar reportes</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Filtra por gestión, carrera, docente, grupos, aulas y periodo. Exporta a CSV/Excel o PDF.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto print:hidden">
            <button
              onClick={exportCSV}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">CSV/Excel</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm"
            >
              <Printer className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      {/* Filtros - Made responsive with better mobile stacking */}
      <div className="bg-white rounded-2xl shadow p-3 sm:p-4 border border-slate-200 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2">
            <Label>Tipo de reporte</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.tipo}
              onChange={(e) => setF({ ...f, tipo: e.target.value as TipoReporte })}
            >
              <option value="horarios">Horarios (docente/grupo/aula)</option>
              <option value="carga">Carga horaria (docente/carrera)</option>
              <option value="asistencia">Asistencia (docente/grupo/periodo)</option>
              <option value="aulas">Uso/Disponibilidad de aulas</option>
            </select>
          </div>

          <div>
            <Label>Gestión</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.gestion}
              onChange={(e) => setF({ ...f, gestion: e.target.value })}
            >
              {gestiones.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Desde</Label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.desde || ""}
              onChange={(e) => setF({ ...f, desde: e.target.value })}
            />
          </div>
          <div>
            <Label>Hasta</Label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.hasta || ""}
              onChange={(e) => setF({ ...f, hasta: e.target.value })}
            />
          </div>

          <div>
            <Label>Carrera</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.carrera || ""}
              onChange={(e) => setF({ ...f, carrera: e.target.value })}
            >
              <option value="">Todas</option>
              {carreras.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Materia</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.materia || ""}
              onChange={(e) => setF({ ...f, materia: e.target.value })}
            >
              <option value="">Todas</option>
              {materias.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Label>Docente</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.docente || ""}
              onChange={(e) => setF({ ...f, docente: e.target.value })}
            >
              <option value="">Todos</option>
              {loadingDocentes && <option disabled>Cargando...</option>}
              {!loadingDocentes && docentes.length === 0 && <option disabled>No hay docentes</option>}
              {docentes.map((d) => (
                <option key={d.id} value={d.nombre}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Grupo</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.grupo || ""}
              onChange={(e) => setF({ ...f, grupo: e.target.value })}
            >
              <option value="">Todos</option>
              {grupos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Aula</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.aula || ""}
              onChange={(e) => setF({ ...f, aula: e.target.value })}
            >
              <option value="">Todas</option>
              {aulas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Turno</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={f.turno || ""}
              onChange={(e) => setF({ ...f, turno: e.target.value as any })}
            >
              <option value="">Todos</option>
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={generate}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm"
            >
              <Search className="w-4 h-4" /> Generar
            </button>
            <button
              onClick={clearAll}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Limpiar
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
      </div>

      {/* Métricas - Made responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4">
        <Card title="Registros">{metrics.a}</Card>
        {f.tipo === "carga" && <Card title="Horas totales">{metrics.b}</Card>}
        {f.tipo === "asistencia" && <Card title="Asistencia promedio">{metrics.b}%</Card>}
        {f.tipo === "aulas" && (
          <>
            <Card title="Ocupación">{metrics.b}%</Card>
            <Card title="Bloques ocupados">{metrics.c}</Card>
            <Card title="Bloques libres">{metrics.d}</Card>
          </>
        )}
      </div>

      {/* Tabla - Added horizontal scroll for mobile */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-800 text-white">
              <TableHead />
            </thead>
            <tbody className="text-slate-900">
              <TableBody />
              {!data.length && (
                <tr>
                  <td className="p-4 sm:p-6 text-center text-slate-600 text-xs sm:text-sm" colSpan={8}>
                    Sin resultados. Ajusta filtros y pulsa <strong>Generar</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// UI helpers
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs sm:text-sm text-slate-700 mb-1">{children}</label>
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-2 sm:px-3 py-2 text-left font-semibold text-xs sm:text-sm ${className}`}>{children}</th>
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 sm:px-3 py-2 text-xs sm:text-sm ${className}`}>{children}</td>
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-3 sm:p-4 border border-slate-200">
      <p className="text-xs text-slate-600">{title}</p>
      <p className="text-xl sm:text-2xl font-semibold text-slate-900">{children}</p>
    </div>
  )
}
function Badge({ pct }: { pct: number }) {
  const tone =
    pct >= 85
      ? "bg-emerald-100 text-emerald-800"
      : pct >= 70
        ? "bg-yellow-100 text-yellow-800"
        : "bg-rose-100 text-rose-800"
  return <span className={`px-2 py-0.5 text-xs rounded-full ${tone}`}>{pct}%</span>
}
