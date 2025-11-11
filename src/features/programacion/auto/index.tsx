"use client";
import { useEffect, useState } from "react";
import { Play, Save, Eye, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import ProgramacionTabs from "../Tabs";
import { listGestiones } from "../api";
import type { Gestion, GestionDTO } from "../../parametros/types";
import { dtoToGestion } from "../../parametros/types";
import { autoPreview, autoConfirm } from "./api.auto";
import type { AutoRow, AutoSummary } from "./types.auto";

/* Alto contraste */
const label = "block text-sm text-slate-800 font-medium";
const input =
  "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
  "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

function SkeletonBar({ w = "w-40" }: { w?: string }) {
  return <div className={`h-4 ${w} rounded bg-slate-500 animate-pulse`} />;
}
function SkeletonRow() {
  return (
    <tr className="border-t">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[160px] rounded bg-slate-500 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function AutoProgramacion() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionId, setGestionId] = useState<number | "">("");

  const [rows, setRows] = useState<AutoRow[]>([]);
  const [totals, setTotals] = useState<AutoSummary>({ total: 0, ok: 0, pendientes: 0, conflictos: 0 });

  const [loading, setLoading] = useState(false); // carga de catálogos
  const [busy, setBusy] = useState(false);       // generar/guardar
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await listGestiones();
        const dtos = data as unknown as GestionDTO[];
        setGestiones(dtos.map(dtoToGestion));
      } catch (e: any) {
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
    } catch (e: any) {
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
    } catch (e: any) {
      setError(e.message || "No se pudo guardar la programación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgramacionTabs />

      <header className="pt-1">
        <h1 className="text-2xl font-semibold text-slate-900">Generación automática</h1>
        <p className="text-slate-700 text-sm">
          Asigna aulas y bloques libres cumpliendo capacidad, turnos y no solapamiento. Revisa la propuesta y guarda
          {loading ? " · Cargando…" : ""}.
        </p>
      </header>

      {/* Selección gestión + acciones — responsive */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-4 ring-1 ring-slate-200">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <SkeletonBar w="w-24" />
              <div className="h-10 rounded bg-slate-500 animate-pulse" />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <div className="h-10 w-40 rounded bg-slate-600 animate-pulse" />
              <div className="h-10 w-56 rounded bg-slate-600 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={label}>Gestión</label>
              <select
                value={gestionId}
                onChange={(e) => setGestionId(e.target.value === "" ? "" : Number(e.target.value))}
                className={input}
              >
                <option value="">— Selecciona —</option>
                {gestiones.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-end gap-2 flex-wrap">
              <button
                onClick={generarPreview}
                disabled={busy || typeof gestionId !== "number"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 disabled:opacity-50"
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
        )}

        {(rows.length > 0) && (
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="inline-flex items-center gap-1 text-slate-800">
              <Eye className="w-4 h-4" /> {totals.total} grupos
            </span>
            <span className="inline-flex items-center gap-1 text-green-700">
              <CheckCircle2 className="w-4 h-4" /> OK: {totals.ok}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="w-4 h-4" /> Pendientes: {totals.pendientes}
            </span>
            <span className="inline-flex items-center gap-1 text-red-700">
              <XCircle className="w-4 h-4" /> Conflictos: {totals.conflictos}
            </span>
          </div>
        )}
      </section>

      {/* Tabla de propuesta — alto contraste + responsive */}
      {rows.length > 0 ? (
        <section className="bg-white rounded-2xl shadow overflow-x-auto ring-1 ring-slate-200">
          <table className="min-w-full text-sm text-slate-900">
            <thead className="bg-slate-900 text-white sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Grupo</th>
                <th className="text-left px-4 py-2 font-semibold">Día</th>
                <th className="text-left px-4 py-2 font-semibold">Inicio</th>
                <th className="text-left px-4 py-2 font-semibold">Fin</th>
                <th className="text-left px-4 py-2 font-semibold">Aula</th>
                <th className="text-left px-4 py-2 font-semibold">Estado</th>
                <th className="text-left px-4 py-2 font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {busy && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {!busy &&
                rows.map((r, i) => {
                  const s = r.sugerido;
                  return (
                    <tr key={i} className="border-t hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2">{r.grupo_label}</td>
                      <td className="px-4 py-2">
                        {s?.dia_semana
                          ? ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][s.dia_semana]
                          : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-4 py-2">{s?.hora_inicio ?? <span className="text-slate-500">—</span>}</td>
                      <td className="px-4 py-2">{s?.hora_fin ?? <span className="text-slate-500">—</span>}</td>
                      <td className="px-4 py-2">{s?.aula_label ?? <span className="text-slate-500">—</span>}</td>
                      <td className="px-4 py-2">
                        {r.status === "ok" && <span className="text-green-700">OK</span>}
                        {r.status === "pendiente" && <span className="text-amber-700">PENDIENTE</span>}
                        {r.status === "conflicto" && <span className="text-red-700">CONFLICTO</span>}
                      </td>
                      <td className="px-4 py-2 text-slate-700">{r.detalle ?? ""}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow p-6 text-slate-700 ring-1 ring-slate-200">
          Aún no hay propuesta. Selecciona una <span className="font-medium">gestión</span> y pulsa{" "}
          <span className="font-medium inline-flex items-center gap-1">
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
