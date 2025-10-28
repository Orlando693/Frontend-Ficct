import { useEffect, useMemo, useState } from "react"
import { ScrollText, RefreshCcw, Search, Trash2 } from "lucide-react"
import type { LogEvent } from "./types"
import * as api from "./api"

type Pager = { page: number; size: number }

export default function BitacoraPage() {
  const [rows, setRows] = useState<LogEvent[]>([])
  const [q, setQ] = useState("")
  const [pager, setPager] = useState<Pager>({ page: 1, size: 10 })

  useEffect(() => { refresh() }, [])

  async function refresh() {
    try {
      const data = await api.list()
      setRows(data)
      setPager(p => ({ ...p, page: 1 }))
    } catch {
      // si falla backend, conserva lo que haya
    }
  }

  async function clearAll() {
    try { await (api as any).clearAll?.() } catch { /* opcional */ }
    setRows([])
    setPager({ page: 1, size: 10 })
  }

  async function removeOne(id: string | number) {
    try { await (api as any).remove?.(id) } catch { /* opcional */ }
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const filtered = useMemo(() => {
    if (!q) return rows
    const qq = q.toLowerCase()
    return rows.filter(r => [
      r.modulo, r.accion, r.detalle, r.usuario, r.ip,
    ].join(" ").toLowerCase().includes(qq))
  }, [rows, q])

  const pages = Math.max(1, Math.ceil(filtered.length / pager.size))
  const slice = filtered.slice((pager.page - 1) * pager.size, pager.page * pager.size)

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-6 shadow">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-semibold">Bitácora</h2>
            <p className="text-slate-300 text-sm">Registros del sistema (módulo, acción, usuario e IP).</p>
          </div>
        </div>
      </header>

      {/* Barra superior como en la imagen */}
      <div className="bg-white rounded-2xl shadow border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="relative md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              title="Actualizar"
            >
              <RefreshCcw className="w-4 h-4" /> Actualizar
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg ring-1 ring-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
              title="Limpiar todo"
            >
              <Trash2 className="w-4 h-4" /> Limpiar todo
            </button>
          </div>
        </div>

        {/* Encabezado “total” a la derecha */}
        <div className="text-right text-xs text-slate-500 mt-2">
          {filtered.length} total
        </div>

        {/* Tabla adaptada */}
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-semibold">FECHA/HORA</th>
                <th className="px-3 py-2 text-left font-semibold">MÓDULO</th>
                <th className="px-3 py-2 text-left font-semibold">ACCIÓN</th>
                <th className="px-3 py-2 text-left font-semibold">DESCRIPCIÓN</th>
                <th className="px-3 py-2 text-left font-semibold">USUARIO</th>
                <th className="px-3 py-2 text-left font-semibold">IP</th>
                <th className="px-3 py-2 text-left font-semibold">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {slice.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className="text-teal-700 font-medium">{r.modulo}</span>
                  </td>
                  <td className="px-3 py-2 uppercase tracking-wide text-slate-700">{r.accion}</td>
                  <td className="px-3 py-2">{r.detalle || r.entidad || "-"}</td>
                  <td className="px-3 py-2">{r.usuario || "—"}</td>
                  <td className="px-3 py-2">{r.ip || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={()=>removeOne(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 ring-1 ring-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-600">
                    Sin registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie: total y paginación tipo «Anterior / Siguiente» */}
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="text-sm text-slate-600">Total: {filtered.length} registros</div>
          <div className="flex items-center gap-2">
            <button
              disabled={pager.page<=1}
              onClick={()=>setPager(p=>({ ...p, page: p.page-1 }))}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
            >
              « Anterior
            </button>
            <span className="text-sm text-slate-600">{pager.page} / {pages}</span>
            <button
              disabled={pager.page>=pages}
              onClick={()=>setPager(p=>({ ...p, page: p.page+1 }))}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
            >
              Siguiente »
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
