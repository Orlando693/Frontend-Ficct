"use client";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import ProgramacionTabs from "../Tabs";
import { listGestiones } from "../api"; // reutiliza la misma que ya funciona
import type { Gestion, GestionDTO } from "../../parametros/types";
import { dtoToGestion } from "../../parametros/types";
import type { AulaMiniDTO } from "../types";
import { searchDisponibilidad } from "./api.disponibilidad";
import type { FiltrosDisp } from "./types.disponibilidad";

const label = "block text-sm text-slate-600";
const input =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

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

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [aulas, setAulas] = useState<AulaMiniDTO[]>([]);

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

  function aplicarTurno(key: "manana" | "tarde" | "noche") {
    // Horarios de ejemplo; si luego vienes de CU11, mapea desde tus parámetros vigentes
    const presets = {
      manana: { ini: "07:00", fin: "11:30" },
      tarde:  { ini: "14:00", fin: "18:00" },
      noche:  { ini: "18:45", fin: "22:00" },
    } as const;
    setF(s => ({ ...s, hora_inicio: presets[key].ini, hora_fin: presets[key].fin }));
  }

  async function consultar() {
    try {
      setBusy(true); setError(null); setAulas([]);
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
    } catch (e:any) {
      setError(e.message || "No se pudo consultar disponibilidad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgramacionTabs />

      <header className="pt-1">
        <h1 className="text-2xl font-semibold">Consultar disponibilidad de aulas</h1>
        <p className="text-slate-600 text-sm">
          Filtra por día/turno/rango, capacidad mínima y tipo; el sistema cruza programación vigente y muestra aulas libres.
          {loading ? " · Cargando…" : ""}
        </p>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-2xl shadow p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={label}>Gestión</label>
            <select
              value={f.gestion_id}
              onChange={(e)=>setF(s=>({ ...s, gestion_id: e.target.value===""? "": Number(e.target.value) }))}
              className={input}
            >
              <option value="">— Selecciona —</option>
              {gestiones.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className={label}>Día</label>
            <select
              value={f.dia_semana}
              onChange={(e)=>setF(s=>({ ...s, dia_semana: e.target.value===""? "": Number(e.target.value) }))}
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
              onChange={(e)=>setF(s=>({ ...s, hora_inicio: e.target.value }))}
              className={input}
              placeholder="08:00"
            />
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-600"
                onClick={()=>aplicarTurno("manana")}>mañana</button>
              <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-600"
                onClick={()=>aplicarTurno("tarde")}>tarde</button>
              <button type="button" className="px-2 py-1 rounded-lg border text-xs text-slate-600"
                onClick={()=>aplicarTurno("noche")}>noche</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Hora fin</label>
            <input
              type="time"
              value={f.hora_fin}
              onChange={(e)=>setF(s=>({ ...s, hora_fin: e.target.value }))}
              className={input}
              placeholder="10:00"
            />
          </div>

          <div className="space-y-2">
            <label className={label}>Capacidad mínima</label>
            <input
              type="number" min={0}
              value={f.min_capacidad}
              onChange={(e)=>setF(s=>({ ...s, min_capacidad: e.target.value===""? "": Number(e.target.value) }))}
              className={input}
              placeholder="40"
            />
          </div>

          <div className="space-y-2">
            <label className={label}>Tipo de aula</label>
            <input
              value={f.tipo}
              onChange={(e)=>setF(s=>({ ...s, tipo: e.target.value }))}
              className={input}
              placeholder="teoria / laboratorio / auditorio"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={consultar}
            disabled={busy || typeof f.gestion_id !== "number" || typeof f.dia_semana !== "number" || !f.hora_inicio || !f.hora_fin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <Search className="w-4 h-4" /> Consultar
          </button>
        </div>
      </section>

      {/* Resultados */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Aula</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Capacidad</th>
            </tr>
          </thead>
          <tbody>
            {aulas.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Sin resultados</td></tr>
            ) : aulas.map(a => (
              <tr key={a.id_aula} className="border-t">
                <td className="px-4 py-2">{a.numero}</td>
                <td className="px-4 py-2">{a.tipo}</td>
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
