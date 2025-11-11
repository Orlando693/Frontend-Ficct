"use client";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import ProgramacionTabs from "../Tabs";
import { listGestiones } from "../api";
import type { Gestion, GestionDTO } from "../../parametros/types";
import { dtoToGestion } from "../../parametros/types";
import type { AulaMiniDTO } from "../types";
import { searchDisponibilidad } from "./api.disponibilidad";
import type { FiltrosDisp } from "./types.disponibilidad";

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
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-500 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500 animate-pulse" /></td>
    </tr>
  );
}

export default function DisponibilidadAulas() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [f, setF] = useState<FiltrosDisp>({
    gestion_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
    min_capacidad: "",
    tipo: "",
  });

  const [loading, setLoading] = useState(false); // carga de catálogos
  const [busy, setBusy] = useState(false);       // consulta
  const [error, setError] = useState<string | null>(null);
  const [aulas, setAulas] = useState<AulaMiniDTO[]>([]);

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

  function aplicarTurno(key: "manana" | "tarde" | "noche") {
    // Presets visibles; si luego lees de parámetros globales, reemplaza aquí.
    const presets = {
      manana: { ini: "07:00", fin: "11:30" },
      tarde:  { ini: "14:00", fin: "18:00" },
      noche:  { ini: "18:45", fin: "22:00" },
    } as const;
    setF((s) => ({ ...s, hora_inicio: presets[key].ini, hora_fin: presets[key].fin }));
  }

  async function consultar() {
    try {
      setBusy(true);
      setError(null);
      setAulas([]);
      if (typeof f.gestion_id !== "number") throw new Error("Selecciona una gestión.");
      if (typeof f.dia_semana !== "number") throw new Error("Selecciona un día.");
      if (!f.hora_inicio || !f.hora_fin) throw new Error("Completa el rango horario.");

      const { data } = await searchDisponibilidad({
        gestion_id: Number(f.gestion_id),
        dia_semana: Number(f.dia_semana),
        hora_inicio: f.hora_inicio,
        hora_fin: f.hora_fin,
        min_capacidad: typeof f.min_capacidad === "number" ? f.min_capacidad : undefined,
        tipo: f.tipo || undefined,
      });
      setAulas(data);
      if (!data?.length) setError("No hay aulas disponibles con esos filtros.");
    } catch (e: any) {
      setError(e.message || "No se pudo consultar disponibilidad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgramacionTabs />

      <header className="pt-1">
        <h1 className="text-2xl font-semibold text-slate-900">Consultar disponibilidad de aulas</h1>
        <p className="text-slate-700 text-sm">
          Filtra por día/turno/rango, capacidad mínima y tipo; el sistema cruza programación vigente y muestra aulas libres
          {loading ? " · Cargando…" : ""}.
        </p>
      </header>

      {/* Filtros — responsive */}
      <section className="bg-white rounded-2xl shadow p-4 ring-1 ring-slate-200">
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2"><SkeletonBar /><div className="h-10 rounded bg-slate-500 animate-pulse" /></div>
            <div className="space-y-2"><SkeletonBar /><div className="h-10 rounded bg-slate-500 animate-pulse" /></div>
            <div className="space-y-2"><SkeletonBar /><div className="h-10 rounded bg-slate-500 animate-pulse" /></div>
            <div className="space-y-2"><SkeletonBar /><div className="h-10 rounded bg-slate-500 animate-pulse" /></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={label}>Gestión</label>
                <select
                  value={f.gestion_id}
                  onChange={(e) => setF((s) => ({ ...s, gestion_id: e.target.value === "" ? "" : Number(e.target.value) }))}
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

              <div className="space-y-2">
                <label className={label}>Día</label>
                <select
                  value={f.dia_semana}
                  onChange={(e) => setF((s) => ({ ...s, dia_semana: e.target.value === "" ? "" : Number(e.target.value) }))}
                  className={input}
                >
                  <option value="">— Selecciona —</option>
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                  <option value={7}>Domingo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={label}>Hora inicio</label>
                <input
                  type="time"
                  value={f.hora_inicio}
                  onChange={(e) => setF((s) => ({ ...s, hora_inicio: e.target.value }))}
                  className={input}
                  placeholder="08:00"
                />
                <div className="flex gap-2">
                  <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-800 hover:bg-slate-100"
                          onClick={() => aplicarTurno("manana")}>mañana</button>
                  <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-800 hover:bg-slate-100"
                          onClick={() => aplicarTurno("tarde")}>tarde</button>
                  <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-800 hover:bg-slate-100"
                          onClick={() => aplicarTurno("noche")}>noche</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={label}>Hora fin</label>
                <input
                  type="time"
                  value={f.hora_fin}
                  onChange={(e) => setF((s) => ({ ...s, hora_fin: e.target.value }))}
                  className={input}
                  placeholder="10:00"
                />
              </div>

              <div className="space-y-2">
                <label className={label}>Capacidad mínima</label>
                <input
                  type="number"
                  min={0}
                  value={f.min_capacidad}
                  onChange={(e) =>
                    setF((s) => ({ ...s, min_capacidad: e.target.value === "" ? "" : Number(e.target.value) }))
                  }
                  className={input}
                  placeholder="40"
                />
              </div>

              <div className="space-y-2">
                <label className={label}>Tipo de aula</label>
                <input
                  value={f.tipo}
                  onChange={(e) => setF((s) => ({ ...s, tipo: e.target.value }))}
                  className={input}
                  placeholder="teoria / laboratorio / auditorio"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={consultar}
                disabled={
                  busy ||
                  typeof f.gestion_id !== "number" ||
                  typeof f.dia_semana !== "number" ||
                  !f.hora_inicio ||
                  !f.hora_fin
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                <Search className="w-4 h-4" /> Consultar
              </button>
            </div>
          </>
        )}
      </section>

      {/* Resultados — alto contraste + responsive */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto ring-1 ring-slate-200">
        <table className="min-w-full text-sm text-slate-900">
          <thead className="bg-slate-900 text-white sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Aula</th>
              <th className="text-left px-4 py-2 font-semibold">Tipo</th>
              <th className="text-left px-4 py-2 font-semibold">Capacidad</th>
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

            {!busy && aulas.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-800">
                  Sin resultados
                </td>
              </tr>
            )}

            {!busy &&
              aulas.map((a) => (
                <tr key={a.id_aula} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2">{a.numero}</td>
                  <td className="px-4 py-2 capitalize">{a.tipo}</td>
                  <td className="px-4 py-2">{a.capacidad}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
    </div>
  );
}
