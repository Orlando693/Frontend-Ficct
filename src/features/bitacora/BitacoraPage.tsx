"use client"

import { useEffect, useMemo, useState } from "react"
import { ScrollText, RefreshCcw, Search, Trash2 } from "lucide-react"
import type { LogEvent } from "./types"
import * as api from "./api"

type Pager = { page: number; size: number }

export default function BitacoraPage() {
  const [rows, setRows] = useState<LogEvent[]>([])
  const [q, setQ] = useState("")
  const [pager, setPager] = useState<Pager>({ page: 1, size: 10 })

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    try {
      const data = await api.list()
      setRows(data)
      setPager((p) => ({ ...p, page: 1 }))
    } catch {
      // si falla backend, conserva lo que haya
    }
  }

  async function clearAll() {
    try {
      await (api as any).clearAll?.()
    } catch {
      /* opcional */
    }
    setRows([])
    setPager({ page: 1, size: 10 })
  }

  async function removeOne(id: string | number) {
    try {
      await (api as any).remove?.(id)
    } catch {
      /* opcional */
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = useMemo(() => {
    if (!q) return rows
    const qq = q.toLowerCase()
    return rows.filter((r) => [r.modulo, r.accion, r.descripcion, r.usuario, r.ip].join(" ").toLowerCase().includes(qq))
  }, [rows, q])

  const pages = Math.max(1, Math.ceil(filtered.length / pager.size))
  const slice = filtered.slice((pager.page - 1) * pager.size, pager.page * pager.size)

  return (
    <div className="space-y-4 md:space-y-6 text-slate-800 p-4 md:p-6">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <ScrollText className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">Bitácora</h2>
            <p className="text-slate-300 text-xs md:text-sm mt-0.5">
              Registros del sistema (módulo, acción, usuario e IP).
            </p>
          </div>
        </div>
      </header>

      {/* Barra superior */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow border border-slate-200 p-3 md:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm md:text-base"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={refresh}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-sm flex-1 sm:flex-none"
              title="Actualizar"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="sm:inline">Actualizar</span>
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg ring-1 ring-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-sm flex-1 sm:flex-none"
              title="Limpiar todo"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sm:inline">Limpiar todo</span>
            </button>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 mt-2">
          {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 -mx-3 md:mx-0">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="border-b">
                <th className="px-2 md:px-3 py-2 text-left font-semibold whitespace-nowrap">FECHA/HORA</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold">MÓDULO</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold">ACCIÓN</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold hidden sm:table-cell">DESCRIPCIÓN</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold hidden md:table-cell">USUARIO</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold hidden lg:table-cell">IP</th>
                <th className="px-2 md:px-3 py-2 text-left font-semibold">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {slice.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-2 md:px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                    {new Date(r.at).toLocaleString("es", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-2 md:px-3 py-2">
                    <span className="text-teal-700 font-medium text-xs md:text-sm">{r.modulo}</span>
                  </td>
                  <td className="px-2 md:px-3 py-2 uppercase tracking-wide text-slate-700 text-xs">{r.accion}</td>
                  <td className="px-2 md:px-3 py-2 hidden sm:table-cell max-w-[200px] truncate">
                    {r.descripcion || r.entidad || "-"}
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden md:table-cell">{r.usuario || "—"}</td>
                  <td className="px-2 md:px-3 py-2 hidden lg:table-cell text-xs">{r.ip || "—"}</td>
                  <td className="px-2 md:px-3 py-2">
                    <button
                      onClick={() => removeOne(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 ring-1 ring-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-600 text-sm">
                    Sin registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
          <div className="text-xs md:text-sm text-slate-600 order-2 sm:order-1">
            Total: {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              disabled={pager.page <= 1}
              onClick={() => setPager((p) => ({ ...p, page: p.page - 1 }))}
              className="px-2 md:px-3 py-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm hover:bg-slate-50"
            >
              « Anterior
            </button>
            <span className="text-xs md:text-sm text-slate-600 px-2">
              {pager.page} / {pages}
            </span>
            <button
              disabled={pager.page >= pages}
              onClick={() => setPager((p) => ({ ...p, page: p.page + 1 }))}
              className="px-2 md:px-3 py-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm hover:bg-slate-50"
            >
              Siguiente »
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
