import { useEffect, useMemo, useState } from "react"
import { ScrollText, Download, Printer, Search, RefreshCcw, ZoomIn } from "lucide-react"
import type { LogEvent, ResultadoLog } from "./types"
import * as api from "./api"

type Pager = { page: number; size: number }
const resultados: ResultadoLog[] = ["OK", "ERROR", "DENEGADO"]

/* ===== Helpers de tabla (aceptan className) ===== */
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }
function Th({ children, className = "", ...rest }: ThProps) {
  return (
    <th className={`px-3 py-2 text-left font-semibold ${className}`} {...rest}>
      {children}
    </th>
  )
}
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }
function Td({ children, className = "", ...rest }: TdProps) {
  return (
    <td className={`px-3 py-2 align-top ${className}`} {...rest}>
      {children}
    </td>
  )
}
function Badge({ t }: { t: ResultadoLog }) {
  const m = {
    OK: "bg-emerald-100 text-emerald-800",
    ERROR: "bg-rose-100 text-rose-800",
    DENEGADO: "bg-amber-100 text-amber-800",
  } as const
  return <span className={`px-2 py-0.5 text-xs rounded-full ${m[t]}`}>{t}</span>
}

/* ===================== Página ===================== */
export default function BitacoraPage() {
  const [rows, setRows] = useState<LogEvent[]>([])
  const [q, setQ] = useState("")
  const [fDesde, setFDesde] = useState<string>("")
  const [fHasta, setFHasta] = useState<string>("")
  const [fUsuario, setFUsuario] = useState("")
  const [fActor, setFActor] = useState("")
  const [fModulo, setFModulo] = useState("")
  const [fAccion, setFAccion] = useState("")
  const [fRes, setFRes] = useState<"" | ResultadoLog>("")
  const [pager, setPager] = useState<Pager>({ page: 1, size: 12 })
  const [detail, setDetail] = useState<LogEvent | null>(null)

  useEffect(() => { api.list().then(setRows) }, [])

  // opciones dinámicas
  const actores = useMemo(() => Array.from(new Set(rows.map(r => r.actor).filter(Boolean))) as string[], [rows])
  const usuarios = useMemo(() => Array.from(new Set(rows.map(r => r.usuario).filter(Boolean))) as string[], [rows])
  const modulos  = useMemo(() => Array.from(new Set(rows.map(r => r.modulo))), [rows])
  const acciones = useMemo(() => Array.from(new Set(rows.map(r => r.accion))), [rows])

  const filtered = useMemo(() => {
    const d0 = fDesde ? +new Date(fDesde) : 0
    const d1 = fHasta ? +new Date(fHasta + "T23:59:59") : Infinity
    return rows
      .filter(r => +new Date(r.at) >= d0 && +new Date(r.at) <= d1)
      .filter(r => !fUsuario || (r.usuario || "").toLowerCase().includes(fUsuario.toLowerCase()))
      .filter(r => !fActor || (r.actor || "") === fActor)
      .filter(r => !fModulo || r.modulo === fModulo)
      .filter(r => !fAccion || r.accion === fAccion)
      .filter(r => !fRes || r.resultado === fRes)
      .filter(r => {
        if (!q) return true
        const text = [r.usuario, r.actor, r.modulo, r.accion, r.entidad, r.detalle].join(" ").toLowerCase()
        return text.includes(q.toLowerCase())
      })
  }, [rows, fDesde, fHasta, fUsuario, fActor, fModulo, fAccion, fRes, q])

  const pages = Math.max(1, Math.ceil(filtered.length / pager.size))
  const slice = filtered.slice((pager.page - 1) * pager.size, pager.page * pager.size)

  function reset() {
    setQ(""); setFDesde(""); setFHasta("")
    setFUsuario(""); setFActor(""); setFModulo(""); setFAccion(""); setFRes("")
    setPager({ page: 1, size: 12 })
  }

  function exportCSV() {
    const csv = api.toCSV(filtered)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bitacora_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  function exportPDF() { window.print() }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6" />
            <div>
              <p className="text-xs tracking-widest text-slate-300">BITÁCORA</p>
              <h2 className="text-2xl font-semibold">Historial auditable del sistema</h2>
              <p className="text-slate-300 text-sm mt-1">
                Filtra por fecha, usuario, actor, entidad, acción y resultado. Exporta a CSV/Excel o PDF.
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Download className="w-4 h-4" /> CSV/Excel
            </button>
            <button onClick={exportPDF} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              <Printer className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 border border-slate-200 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Desde</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={fDesde} onChange={(e)=>setFDesde(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Hasta</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={fHasta} onChange={(e)=>setFHasta(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Actor</label>
            <select className="w-full border rounded-lg px-3 py-2" value={fActor} onChange={(e)=>setFActor(e.target.value)}>
              <option value="">Todos</option>
              {useMemo(() => Array.from(new Set(rows.map(r => r.actor).filter(Boolean))) as string[], [rows]).map(a => <option key={a} value={a!}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Usuario</label>
            <select className="w-full border rounded-lg px-3 py-2" value={fUsuario} onChange={(e)=>setFUsuario(e.target.value)}>
              <option value="">Todos</option>
              {useMemo(() => Array.from(new Set(rows.map(r => r.usuario).filter(Boolean))) as string[], [rows]).map(u => <option key={u} value={u!}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Módulo</label>
            <select className="w-full border rounded-lg px-3 py-2" value={fModulo} onChange={(e)=>setFModulo(e.target.value)}>
              <option value="">Todos</option>
              {useMemo(() => Array.from(new Set(rows.map(r => r.modulo))), [rows]).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Acción</label>
            <select className="w-full border rounded-lg px-3 py-2" value={fAccion} onChange={(e)=>setFAccion(e.target.value)}>
              <option value="">Todas</option>
              {useMemo(() => Array.from(new Set(rows.map(r => r.accion))), [rows]).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Resultado</label>
            <select className="w-full border rounded-lg px-3 py-2" value={fRes} onChange={(e)=>setFRes(e.target.value as any)}>
              <option value="">Todos</option>
              {resultados.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300"
                placeholder="Texto libre (detalle, entidad, IP…)"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 md:justify-end md:col-span-3">
            <button onClick={()=>setPager(p=>({ ...p, page: 1 }))} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              Aplicar filtros
            </button>
            <button onClick={reset} className="px-4 py-2 rounded-lg border">
              <RefreshCcw className="w-4 h-4 inline mr-1" /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <Th>Fecha/Hora</Th>
                <Th>Usuario</Th>
                <Th>Actor</Th>
                <Th>Módulo</Th>
                <Th>Acción</Th>
                <Th>Entidad</Th>
                <Th>Resultado</Th>
                <Th>Detalle</Th>
                <Th className="print:hidden">Ver</Th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {slice.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <Td>{new Date(r.at).toLocaleString()}</Td>
                  <Td>{r.usuario || "-"}</Td>
                  <Td>{r.actor || "-"}</Td>
                  <Td>{r.modulo}</Td>
                  <Td>{r.accion}</Td>
                  <Td>{r.entidad || "-"}</Td>
                  <Td><Badge t={r.resultado} /></Td>
                  <Td>{r.detalle || "-"}</Td>
                  <Td className="print:hidden">
                    <button onClick={()=>setDetail(r)} className="px-2 py-1 rounded-lg border hover:bg-slate-50 inline-flex items-center gap-1">
                      <ZoomIn className="w-4 h-4" /> Detalle
                    </button>
                  </Td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-600" colSpan={9}>
                    Sin resultados. Ajusta los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between gap-3 p-3 border-t print:hidden">
          <div className="text-xs text-slate-600">
            {filtered.length ? (
              <>Mostrando <b>{(pager.page - 1) * pager.size + 1}</b> – <b>{Math.min(pager.page * pager.size, filtered.length)}</b> de <b>{filtered.length}</b></>
            ) : <>0 de 0</>
            }
          </div>
          <div className="flex items-center gap-2">
            <button disabled={pager.page<=1} onClick={()=>setPager(p=>({ ...p, page: p.page-1 }))} className="px-2 py-1 rounded-lg border disabled:opacity-50">«</button>
            {Array.from({ length: pages }).slice(0, 6).map((_, i) => {
              const n = i + 1
              return (
                <button key={n} onClick={()=>setPager(p=>({ ...p, page: n }))} className={`px-3 py-1 rounded-lg border ${pager.page===n? "bg-slate-900 text-white border-slate-900":"hover:bg-slate-50"}`}>{n}</button>
              )
            })}
            <button disabled={pager.page>=pages} onClick={()=>setPager(p=>({ ...p, page: p.page+1 }))} className="px-2 py-1 rounded-lg border disabled:opacity-50">»</button>
            <select value={pager.size} onChange={(e)=>setPager({ page:1, size: Number(e.target.value) })} className="ml-2 border rounded px-2 py-1 text-sm">
              {[12,25,50].map(s=><option key={s} value={s}>{s}/pág</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Detalle del evento</h3>
              <button onClick={()=>setDetail(null)} className="px-3 py-1 rounded-lg border">Cerrar ✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><b>Fecha/Hora:</b> {new Date(detail.at).toLocaleString()}</div>
              <div><b>IP:</b> {detail.ip || "-"}</div>
              <div><b>Usuario:</b> {detail.usuario || "-"}</div>
              <div><b>Actor:</b> {detail.actor || "-"}</div>
              <div><b>Módulo:</b> {detail.modulo}</div>
              <div><b>Acción:</b> {detail.accion}</div>
              <div><b>Entidad:</b> {detail.entidad || "-"}</div>
              <div><b>Resultado:</b> {detail.resultado}</div>
            </div>
            {detail.filtros && (
              <div className="mt-4">
                <p className="text-sm font-medium">Filtros</p>
                <pre className="mt-1 bg-slate-50 border rounded-lg p-3 text-xs overflow-x-auto">{JSON.stringify(detail.filtros, null, 2)}</pre>
              </div>
            )}
            {detail.detalle && (
              <div className="mt-3">
                <p className="text-sm font-medium">Detalle</p>
                <p className="text-sm bg-slate-50 border rounded-lg p-3">{detail.detalle}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
