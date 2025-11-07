"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { listSesionesDocente, marcarAsistencia } from "./api";
import type { SesionDocenteDTO, EstadoAsistencia } from "./types";
import JustificarModal from "./JustificarModal";

const label = "block text-sm text-slate-600";
const input =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

const EARLY_MIN = 15;  // minutos antes del inicio
const LATE_MIN  = 30;  // minutos después del fin

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}
function parseTime(dateISO: string, hhmm: string) {
  const [H, M] = hhmm.split(":").map(Number);
  const d = new Date(dateISO + "T00:00:00");
  d.setHours(H, M, 0, 0);
  return d;
}
function withinWindow(sess: SesionDocenteDTO, ahora = new Date()) {
  const ini = parseTime(sess.fecha, sess.hora_inicio);
  const fin = parseTime(sess.fecha, sess.hora_fin);
  const open = new Date(ini.getTime() - EARLY_MIN*60000);
  const close = new Date(fin.getTime() + LATE_MIN*60000);
  return ahora >= open && ahora <= close;
}

export default function AsistenciaDocente() {
  const [fecha, setFecha] = useState<string>(todayStr());
  const [items, setItems] = useState<SesionDocenteDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [ok, setOk] = useState<string|null>(null);

  const [justOpen, setJustOpen] = useState(false);
  const [justHorarioId, setJustHorarioId] = useState<number | null>(null);

  // reloj para habilitar/deshabilitar en vivo
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      setLoading(true); setError(null); setOk(null);
      const { data } = await listSesionesDocente(fecha);
      setItems(data);
    } catch (e:any) {
      setError(e.message || "No se pudieron cargar sus sesiones");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [fecha]);

  async function marcar(horario_id: number, estado: Exclude<EstadoAsistencia,"pendiente">, justificacion?: string) {
    try {
      setBusy(true); setError(null); setOk(null);
      await marcarAsistencia({ horario_id, fecha, estado, justificacion });
      await load();
      setOk("Asistencia registrada correctamente.");
    } catch (e:any) {
      setError(e.message || "No se pudo registrar la asistencia");
    } finally {
      setBusy(false);
    }
  }

  const dias = ["","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

  const hoyLeyenda = useMemo(() => {
    return `La ventana de marcado está habilitada desde ${EARLY_MIN} minutos antes del inicio hasta ${LATE_MIN} minutos después del fin.`;
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Asistencia</h1>
        <p className="text-slate-600 text-sm">{hoyLeyenda}</p>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-2xl shadow p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={label}>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e)=>setFecha(e.target.value)}
              className={input}
            />
          </div>
        </div>
      </section>

      {/* Lista de sesiones */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Materia / Grupo</th>
              <th className="text-left px-4 py-2">Día</th>
              <th className="text-left px-4 py-2">Horario</th>
              <th className="text-left px-4 py-2">Aula</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                {loading ? "Cargando…" : "No hay sesiones para esta fecha"}
              </td></tr>
            )}

            {items.map(s => {
              const puedeMarcar = withinWindow(s, now) && (s.estado === undefined || s.estado === "pendiente");
              return (
                <tr key={s.id_horario} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">{s.materia_label ?? "—"}</div>
                    <div className="text-slate-500">{s.grupo_label}</div>
                  </td>
                  <td className="px-4 py-2">{dias[s.dia_semana]}</td>
                  <td className="px-4 py-2">{s.hora_inicio} – {s.hora_fin}</td>
                  <td className="px-4 py-2">{s.aula_label}</td>
                  <td className="px-4 py-2">
                    {s.estado === "presente"    && <span className="text-green-600">PRESENTE</span>}
                    {s.estado === "ausente"     && <span className="text-red-600">AUSENTE</span>}
                    {s.estado === "justificado" && <span className="text-amber-600">JUSTIFICADO</span>}
                    {(!s.estado || s.estado === "pendiente") && <span className="text-slate-500">PENDIENTE</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={()=>marcar(s.id_horario, "presente")}
                        disabled={!puedeMarcar || busy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-50"
                        title="Marcar presente"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Presente
                      </button>
                      <button
                        onClick={()=>{ setJustHorarioId(s.id_horario); setJustOpen(true); }}
                        disabled={busy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title="Registrar justificación"
                      >
                        <XCircle className="w-4 h-4" /> Justificar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {busy && (
          <div className="p-3 text-sm text-slate-600 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Procesando…
          </div>
        )}
      </section>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {ok && <div className="p-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{ok}</div>}

      {/* Modal de justificación */}
      <JustificarModal
        open={justOpen}
        onCancel={()=>{ setJustOpen(false); setJustHorarioId(null); }}
        busy={busy}
        onSubmit={async ({ justificacion }) => {
          if (!justHorarioId) return;
          await marcar(justHorarioId, "justificado", justificacion);
          setJustOpen(false);
          setJustHorarioId(null);
        }}
      />
    </div>
  );
}
