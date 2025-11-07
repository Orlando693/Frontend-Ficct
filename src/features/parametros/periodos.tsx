import { useEffect, useState } from "react";
import { Search, Plus, Loader2, Pencil } from "lucide-react";
import { listGestiones, createGestion, updateGestion } from "./api.gestiones";
import type { Gestion } from "./types";

const inputCls =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";
const labelCls = "block text-sm text-slate-600";

export default function Periodos() {
  const [items, setItems] = useState<Gestion[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Gestion | null>(null);

  async function fetchData() {
    try { setLoading(true); setError(null);
      const res = await listGestiones(q.trim() || undefined);
      setItems(res.data);
    } catch (e:any) {
      setError(e.message || "Error al listar periodos");
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ fetchData(); }, [q]);

  function openCreate(){ setEditing(null); setOpen(true); }
  function openEdit(g: Gestion){ setEditing(g); setOpen(true); }

  async function save(p:{ anio:number; periodo:number; fecha_ini:string; fecha_fin:string; }) {
    try {
      setBusy(true); setError(null);
      if (editing) await updateGestion(editing.id, p);
      else await createGestion(p);
      setOpen(false); fetchData();
    } catch (e:any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Periodos académicos</h2>
          <p className="text-slate-600 text-sm">
            Define año, periodo y fechas {loading ? " · Cargando…" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Nuevo periodo
        </button>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Buscar por año/periodo…"
          className={"w-full pl-9 pr-3 py-2 " + inputCls}
        />
      </div>

      <div className="bg-white rounded-2xl shadow divide-y">
        <div className="px-4 py-3 text-sm text-slate-600">{items.length} periodo(s)</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="text-left px-4 py-2">Año</th>
                <th className="text-left px-4 py-2">Periodo</th>
                <th className="text-left px-4 py-2">Rango</th>
                <th className="text-left px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length===0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">Sin resultados</td>
                </tr>
              )}
              {items.map(g=>(
                <tr key={g.id} className="border-t">
                  <td className="px-4 py-2">{g.anio}</td>
                  <td className="px-4 py-2">{g.periodo}</td>
                  <td className="px-4 py-2">{g.fecha_ini} → {g.fecha_fin}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={()=>openEdit(g)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}

      <GestionModal
        open={open}
        initial={editing ? {
          anio: editing.anio, periodo: editing.periodo, fecha_ini: editing.fecha_ini, fecha_fin: editing.fecha_fin
        } : undefined}
        onCancel={()=>setOpen(false)}
        onSubmit={save}
        busy={busy}
      />
    </div>
  );
}

/** Modal embebido (hooks siempre antes del guard) */
function GestionModal({
  open, initial, onCancel, onSubmit, busy=false,
}:{
  open: boolean;
  initial?: { anio:number; periodo:number; fecha_ini:string; fecha_fin:string };
  onCancel: () => void;
  onSubmit: (v:{ anio:number; periodo:number; fecha_ini:string; fecha_fin:string }) => void|Promise<void>;
  busy?: boolean;
}) {
  const [anio, setAnio] = useState<number | "">(initial?.anio ?? "");
  const [periodo, setPeriodo] = useState<number | "">(initial?.periodo ?? "");
  const [fechaIni, setFechaIni] = useState<string>(initial?.fecha_ini ?? "");
  const [fechaFin, setFechaFin] = useState<string>(initial?.fecha_fin ?? "");

  const label = "block text-sm text-slate-600";
  const input =
    "w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

  if (!open) return null;

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if (anio!=="" && periodo!=="" && fechaIni && fechaFin) {
      await onSubmit({
        anio: Number(anio),
        periodo: Number(periodo),
        fecha_ini: fechaIni,
        fecha_fin: fechaFin,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel}/>
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {initial ? "Editar periodo" : "Nuevo periodo"}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={label}>Año</label>
            <input
              type="number" min={2000} max={2100}
              value={anio}
              onChange={(e)=>setAnio(e.target.value===""? "": Number(e.target.value))}
              placeholder="2025"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className={label}>Periodo</label>
            <input
              type="number" min={1} max={3}
              value={periodo}
              onChange={(e)=>setPeriodo(e.target.value===""? "": Number(e.target.value))}
              placeholder="1"
              className={input}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={label}>Fecha inicio</label>
            <input
              type="date" value={fechaIni}
              onChange={(e)=>setFechaIni(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className={label}>Fecha fin</label>
            <input
              type="date" value={fechaFin}
              onChange={(e)=>setFechaFin(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={input}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={busy}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
