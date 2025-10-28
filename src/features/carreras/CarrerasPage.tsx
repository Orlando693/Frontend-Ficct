"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { GraduationCap, Plus, Search, ToggleLeft, ToggleRight, Pencil } from "lucide-react"
import type { Carrera, EstadoCarrera } from "./types"
import * as api from "./api"
import CareerFormModal from "./CareerFormModal"

const estados: EstadoCarrera[] = ["ACTIVA", "INACTIVA"]

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "red" | "slate" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-800 ring-slate-200",
    green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    red: "bg-rose-100 text-rose-800 ring-rose-200",
  }
  return <span className={`px-2 py-0.5 text-xs rounded-full ring-1 ${map[tone]}`}>{children}</span>
}

export default function CarrerasPage() {
  const [data, setData] = useState<Carrera[]>([])
  const [q, setQ] = useState("")
  const [fEstado, setFEstado] = useState<"" | EstadoCarrera>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState<Carrera | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.list().then(setData)
  }, [])

  const view = useMemo(
    () =>
      data
        .filter((c) => !fEstado || c.estado === fEstado)
        .filter((c) => (c.nombre + " " + c.sigla).toLowerCase().includes(q.toLowerCase())),
    [data, q, fEstado],
  )

  function toneEstado(s: EstadoCarrera) {
    return s === "ACTIVA" ? "green" : "red"
  }

  async function crear(payload: Omit<Carrera, "id" | "materiasAsociadas" | "gruposAsociados">) {
    const c = await api.create(payload)
    setData((d) => [c, ...d])
    setMsg("Carrera creada.")
  }
  async function editar(payload: Partial<Carrera>) {
    const c = await api.update(payload.id!, payload)
    setData((d) => d.map((x) => (x.id === c.id ? c : x)))
    setMsg("Carrera actualizada.")
  }
  async function setEstado(c: Carrera, estado: EstadoCarrera) {
    const up = await api.setEstado(c.id, estado)
    setData((d) => d.map((x) => (x.id === up.id ? up : x)))
    setMsg(`Carrera ${estado === "ACTIVA" ? "activada" : "inactivada"}.`)
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-slate-800 p-4 sm:p-0">
      {/* Header - Made responsive with stacked layout on mobile */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-4 sm:p-6 shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs tracking-widest text-slate-300">CARRERAS</p>
              <h2 className="text-xl sm:text-2xl font-semibold">Gestionar carreras</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Administra el catálogo: crear, editar, activar/inactivar. Control de sigla única.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditRow(null)
              setModalOpen(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow text-sm"
          >
            <Plus className="w-4 h-4" /> Nueva carrera
          </button>
        </div>
      </header>

      {/* Filtros - Made responsive with stacked layout on mobile */}
      <div className="bg-white rounded-2xl shadow p-3 sm:p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por nombre o sigla…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
            />
          </label>

          <select
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-sm"
            value={fEstado}
            onChange={(e) => setFEstado(e.target.value as EstadoCarrera | "")}
          >
            <option value="">Todos los estados</option>
            {estados.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mensaje */}
      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3 sm:p-4">
          <div className="flex justify-between items-start gap-4">
            <p className="text-xs sm:text-sm">{msg}</p>
            <button
              onClick={() => setMsg(null)}
              className="text-xs sm:text-sm text-blue-800 hover:underline flex-shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tabla - Added horizontal scroll and responsive columns */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="text-left bg-slate-800 text-white">
              <tr>
                <th className="px-3 sm:px-4 py-3 font-semibold">Nombre</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Sigla</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">Estado</th>
                <th className="px-3 sm:px-4 py-3 font-semibold hidden md:table-cell">Asociaciones</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {view.map((c) => (
                <tr key={c.id} className="border-b last:border-0 border-slate-200 hover:bg-slate-50">
                  <td className="px-3 sm:px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-3 sm:px-4 py-3">{c.sigla}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <Badge tone={toneEstado(c.estado) as any}>{c.estado}</Badge>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-600">
                      {c.materiasAsociadas} materias • {c.gruposAsociados} grupos
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                      <button
                        onClick={() => {
                          setEditRow(c)
                          setModalOpen(true)
                        }}
                        className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5 text-xs"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editar</span>
                      </button>

                      {c.estado === "ACTIVA" ? (
                        <button
                          onClick={() => setEstado(c, "INACTIVA")}
                          className="px-2 sm:px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 inline-flex items-center gap-1.5 text-xs"
                          title="Inactivar"
                        >
                          <ToggleLeft className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Inactivar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setEstado(c, "ACTIVA")}
                          className="px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5 text-xs"
                          title="Activar"
                        >
                          <ToggleRight className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Activar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {view.length === 0 && (
                <tr>
                  <td className="px-3 sm:px-4 py-6 sm:py-8 text-center text-slate-600 text-xs sm:text-sm" colSpan={5}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <CareerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editRow}
        onSubmit={async (payload) => {
          if ((payload as any).id) await editar(payload as any)
          else await crear(payload as any)
        }}
      />
    </div>
  )
}
