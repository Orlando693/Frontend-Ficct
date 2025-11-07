"use client";
import { useEffect, useState } from "react";
import { Play, Save, Eye, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import ProgramacionTabs from "../Tabs";
import { listGestiones } from "../api";
import type { Gestion, GestionDTO } from "../../parametros/types";
import { dtoToGestion } from "../../parametros/types";
import { autoPreview, autoConfirm } from "./api.auto";
import type { AutoRow, AutoSummary } from "./types.auto";

const label = "block text-sm text-slate-600";
const input =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

export default function AutoProgramacion() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionId, setGestionId] = useState<number | "">("");

  const [rows, setRows] = useState<AutoRow[]>([]);
  const [totals, setTotals] = useState<AutoSummary>({ total: 0, ok: 0, pendientes: 0, conflictos: 0 });

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [ok, setOk] = useState<string|null>(null);

  // Cargar gestiones
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await listGestiones();
        const dtos = data as unknown as GestionDTO[];
        setGestiones(dtos.map(dtoToGestion));
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar gestiones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function generarPreview() {
    try {
      setBusy(true); setError(null); setOk(null);
      if (typeof gestionId !== "number") throw new Error("Selecciona una gestión.");

      const { data } = await autoPreview(Number(gestionId));
      setRows(data.rows);
      setTotals(data.totals);
    } catch (e:any) {
      setError(e.message || "No se pudo generar la propuesta");
    } finally {
      setBusy(false);
    }
  }

  async function guardarConfirm() {
    try {
      setBusy(true); setError(null); setOk(null);
      if (typeof gestionId !== "number") throw new Error("Selecciona una gestión.");
      if (rows.length === 0) throw new Error("Genera primero una propuesta.");

      const { data } = await autoConfirm(Number(gestionId));
      setOk(`Guardado OK · insertados: ${data.inserted}, actualizados: ${data.updated}, omitidos: ${data.skipped}, errores: ${data.errors}`);
    } catch (e:any) {
      setError(e.message || "No se pudo guardar la programación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub-nav local entre Manual y Automática */}
      <ProgramacionTabs />

      <header className="pt-1">
        <h1 className="text-2xl font-semibold">Generación automática</h1>
        <p className="text-slate-600 text-sm">
          Asigna aulas y bloques libres cumpliendo capacidad, turnos y no solapamiento. Revisa la propuesta y guarda.
          {loading ? " · Cargando…" : ""}
        </p>
      </header>

      {/* Selección gestión + acciones */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={label}>Gestión</label>
            <select
              value={gestionId}
              onChange={(e)=>setGestionId(e.target.value===""? "": Number(e.target.value))}
              className={input}
            >
              <option value="">— Selecciona —</option>
              {gestiones.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <button
              onClick={generarPreview}
              disabled={busy || typeof gestionId !== "number"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Generar propuesta
            </button>
            <button
              onClick={guardarConfirm}
              disabled={busy || rows.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Guardar programación
            </button>
          </div>
        </div>

        {(rows.length > 0) && (
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 text-slate-700"><Eye className="w-4 h-4" /> {totals.total} grupos</span>
            <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> OK: {totals.ok}</span>
            <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="w-4 h-4" /> Pendientes: {totals.pendientes}</span>
            <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Conflictos: {totals.conflictos}</span>
          </div>
        )}
      </section>

      {/* Tabla de propuesta */}
      {rows.length > 0 ? (
        <section className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="text-left px-4 py-2">Grupo</th>
                <th className="text-left px-4 py-2">Día</th>
                <th className="text-left px-4 py-2">Inicio</th>
                <th className="text-left px-4 py-2">Fin</th>
                <th className="text-left px-4 py-2">Aula</th>
                <th className="text-left px-4 py-2">Estado</th>
                <th className="text-left px-4 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const s = r.sugerido;
                return (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{r.grupo_label}</td>
                    <td className="px-4 py-2">
                      {s?.dia_semana
                        ? ["","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"][s.dia_semana]
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-2">{s?.hora_inicio ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2">{s?.hora_fin ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2">{s?.aula_label ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2">
                      {r.status === "ok"        && <span className="text-green-600">OK</span>}
                      {r.status === "pendiente" && <span className="text-amber-600">PENDIENTE</span>}
                      {r.status === "conflicto" && <span className="text-red-600">CONFLICTO</span>}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{r.detalle ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow p-6 text-slate-500">
          Aún no hay propuesta. Selecciona una <span className="text-slate-600 font-medium">gestión</span> y pulsa{" "}
          <span className="text-slate-600 font-medium inline-flex items-center gap-1">
            <Play className="w-4 h-4" /> Generar propuesta
          </span>.
        </section>
      )}

      {/* Mensajes */}
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {ok && <div className="p-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{ok}</div>}
    </div>
  );
}
