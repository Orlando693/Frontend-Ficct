"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { listSesionesDocente, marcarAsistencia } from "./api";
import type { SesionDocenteDTO, EstadoAsistencia } from "./types";
import JustificarModal from "./JustificarModal";

const label = "block text-sm text-slate-800";
const input =
  "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
  "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

const EARLY_MIN = 15;
const LATE_MIN  = 30;

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

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-200">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[200px] rounded bg-neutral-900 animate-pulse" />
        </td>
      ))}
    </tr>
  );
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
  const hoyLeyenda = useMemo(() => (
    `La ventana de marcado está habilitada desde ${EARLY_MIN} minutos antes del inicio hasta ${LATE_MIN} minutos después del fin.`
  ), []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Asistencia</h1>
        <p className="text-slate-700 text-sm">{hoyLeyenda}</p>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-2xl shadow p-4 ring-1 ring-slate-200">
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

      {/* Lista de sesiones (alto contraste) */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto ring-1 ring-slate-200">
        <table className="min-w-full text-sm text-slate-900">
          <thead className="bg-slate-900 text-white sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Materia / Grupo</th>
              <th className="text-left px-4 py-2 font-semibold">Día</th>
              <th className="text-left px-4 py-2 font-semibold">Horario</th>
              <th className="text-left px-4 py-2 font-semibold">Aula</th>
              <th className="text-left px-4 py-2 font-semibold">Estado</th>
              <th className="text-left px-4 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading && (<>
              <SkeletonRow/><SkeletonRow/><SkeletonRow/>
            </>)}

            {!loading && items.length === 0 && (
              <tr className="bg-white">
                <td colSpan={6} className="px-4 py-6 text-center text-slate-800">
                  No hay sesiones para esta fecha
                </td>
              </tr>
            )}

            {!loading && items.map((s, idx) => {
              const puedeMarcar = withinWindow(s, now) && (s.estado === undefined || s.estado === "pendiente");
              return (
                <tr
                  key={s.id_horario}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors`}
                >
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-900">{s.materia_label ?? "—"}</div>
                    <div className="text-slate-600">{s.grupo_label}</div>
                  </td>
                  <td className="px-4 py-2">{dias[s.dia_semana]}</td>
                  <td className="px-4 py-2">{s.hora_inicio} – {s.hora_fin}</td>
                  <td className="px-4 py-2">{s.aula_label}</td>
                  <td className="px-4 py-2">
                    {s.estado === "presente"    && <span className="px-2 py-0.5 rounded text-white bg-green-600">PRESENTE</span>}
                    {s.estado === "ausente"     && <span className="px-2 py-0.5 rounded text-white bg-red-600">AUSENTE</span>}
                    {s.estado === "justificado" && <span className="px-2 py-0.5 rounded text-white bg-amber-600">JUSTIFICADO</span>}
                    {(!s.estado || s.estado === "pendiente") && <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800">PENDIENTE</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={()=>marcar(s.id_horario, "presente")}
                        disabled={!puedeMarcar || busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                        title="Marcar presente"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
                        Presente
                      </button>
                      <button
                        onClick={()=>{ setJustHorarioId(s.id_horario); setJustOpen(true); }}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm"
                        title="Registrar justificación"
                      >
                        <XCircle className="w-4 h-4 text-slate-900" /> Justificar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {busy && (
          <div className="p-3 text-sm text-slate-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Procesando…
          </div>
        )}
      </section>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {ok && <div className="p-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{ok}</div>}

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
