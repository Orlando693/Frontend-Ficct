import { Loader2, CalendarDays, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { AulaMiniDTO, DisponibilidadResp } from "./types";
import { checkDisponibilidad, listAulasActivas } from "./api";

type FormState = {
  dia_semana: number | "";
  hora_inicio: string;
  hora_fin: string;
  aula_id: number | "";
};

export default function HorarioModal({
  open,
  gestionId,
  grupoId,
  onCancel,
  onSubmit,
  busy = false,
}: {
  open: boolean;
  gestionId: number;
  grupoId: number;
  onCancel: () => void;
  onSubmit: (values: Required<FormState>) => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
    aula_id: "",
  });
  const [aulas, setAulas] = useState<AulaMiniDTO[]>([]);
  const [dispo, setDispo] = useState<DisponibilidadResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true); setError(null);
        const { data } = await listAulasActivas();
        setAulas(data);
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar aulas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  async function consultar() {
    try {
      setChecking(true); setError(null);
      const { dia_semana, hora_inicio, hora_fin } = form;
      if (dia_semana === "" || !hora_inicio || !hora_fin) {
        throw new Error("Completa día y rango horario para consultar.");
      }
      const { data } = await checkDisponibilidad({
        gestion_id: gestionId,
        grupo_id: grupoId,
        dia_semana: Number(dia_semana),
        hora_inicio, hora_fin
      });
      setDispo(data);
      if (data.disponibles?.length) setAulas(data.disponibles);
    } catch (e:any) {
      setError(e.message || "No se pudo consultar disponibilidad.");
    } finally {
      setChecking(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.dia_semana === "" || form.aula_id === "" || !form.hora_inicio || !form.hora_fin) return;
    onSubmit({
      dia_semana: Number(form.dia_semana),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      aula_id: Number(form.aula_id),
    });
  }

  const label = "block text-sm text-slate-800";
  const input =
    "w-full rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl p-6 space-y-4 ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-slate-800" /> Nuevo bloque / Programación
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={label}>Día</label>
            <select
              value={form.dia_semana}
              onChange={(e)=>setForm(s=>({ ...s, dia_semana: e.target.value===""? "": Number(e.target.value) }))}
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
            <label className={label}>Aula</label>
            <select
              value={form.aula_id}
              onChange={(e)=>setForm(s=>({ ...s, aula_id: e.target.value===""? "": Number(e.target.value) }))}
              className={input}
            >
              <option value="">— Selecciona —</option>
              {aulas.map(a=>(
                <option key={a.id_aula} value={a.id_aula}>
                  {a.numero} ({a.tipo}) · cap {a.capacidad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={label}>Hora inicio</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e)=>setForm(s=>({ ...s, hora_inicio: e.target.value }))}
                className={`${input} pl-9`}
                placeholder="08:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Hora fin</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e)=>setForm(s=>({ ...s, hora_fin: e.target.value }))}
                className={`${input} pl-9`}
                placeholder="10:00"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={consultar}
            disabled={checking}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {checking && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            Ver disponibilidad
          </button>

          {dispo?.conflictos?.length ? (
            <span className="text-sm text-red-600">{dispo.conflictos.length} conflicto(s) detectado(s)</span>
          ) : dispo ? (
            <span className="text-sm text-green-600">Sin choques (aula/docente/grupo)</span>
          ) : null}
        </div>

        {loading && <div className="h-3 w-40 rounded bg-neutral-900 animate-pulse" />}
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm text-slate-800 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
