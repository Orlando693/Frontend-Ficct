import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getParametros, saveParametros } from "./api.parametros";
import type { ParametrosDTO, TurnoCfg, TurnoKey } from "./types";

const labelCls = "block text-sm text-slate-600";
const inputCls =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

const dias = [
  { n: 1, label: "Lun" }, { n: 2, label: "Mar" }, { n: 3, label: "Mié" },
  { n: 4, label: "Jue" }, { n: 5, label: "Vie" }, { n: 6, label: "Sáb" }, { n: 7, label: "Dom" },
];

export default function Parametros() {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [ok, setOk] = useState<string|null>(null);

  const [duracion, setDuracion] = useState<number | "">("");
  const [diasHab, setDiasHab] = useState<number[]>([]);
  const [turnos, setTurnos] = useState<TurnoCfg[]>([
    { turno: "manana", inicio: "07:00", fin: "11:30" },
    { turno: "tarde",  inicio: "13:30", fin: "17:30" },
    { turno: "noche",  inicio: "18:45", fin: "22:15" },
  ]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await getParametros();
        setDuracion(data.duracion_bloque_min);
        setDiasHab(data.dias_habiles || []);
        if (data.turnos?.length) setTurnos(data.turnos);
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar los parámetros");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggleDia(n:number) {
    setDiasHab(prev => prev.includes(n) ? prev.filter(d=>d!==n) : [...prev, n].sort((a,b)=>a-b));
  }
  function setTurnoField(k:TurnoKey, field:"inicio"|"fin", val:string) {
    setTurnos(prev => prev.map(t => t.turno === k ? { ...t, [field]: val } : t));
  }

  async function save() {
    try {
      setBusy(true); setError(null); setOk(null);
      if (duracion === "" || diasHab.length === 0) throw new Error("Completa duración y selecciona al menos un día hábil.");
      for (const t of turnos) {
        if (!t.inicio || !t.fin || t.fin <= t.inicio) throw new Error("Revisa horas de cada turno.");
      }
      const payload: ParametrosDTO = {
        duracion_bloque_min: Number(duracion),
        dias_habiles: diasHab,
        turnos,
      };
      await saveParametros(payload);
      setOk("Parámetros guardados");
    } catch (e:any) {
      setError(e.message || "No se pudieron guardar los parámetros");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Parámetros de horario</h2>
        <p className="text-slate-600 text-sm">
          Días hábiles, duración de bloque y franjas por turno{loading ? " · Cargando…" : ""}
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Duración de bloque (min)</label>
          <input
            type="number" min={15} step={5}
            value={duracion}
            onChange={(e)=>setDuracion(e.target.value==="" ? "" : Number(e.target.value))}
            placeholder="30"
            className={inputCls}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className={labelCls}>Días hábiles</label>
          <div className="flex flex-wrap gap-2">
            {dias.map(d => (
              <button
                key={d.n} type="button" onClick={()=>toggleDia(d.n)}
                className={`px-3 py-1.5 rounded-xl border text-sm ${
                  diasHab.includes(d.n)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3 text-slate-800">Turnos / Franjas</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {turnos.map(t => (
            <div key={t.turno} className="space-y-2 border rounded-xl p-3">
              <div className="text-sm text-slate-600 capitalize">{t.turno}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Inicio</label>
                  <input
                    type="time" value={t.inicio}
                    onChange={(e)=>setTurnoField(t.turno, "inicio", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fin</label>
                  <input
                    type="time" value={t.fin}
                    onChange={(e)=>setTurnoField(t.turno, "fin", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">Ej.: 07:00 → 11:30</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        {ok && <span className="text-green-600 text-sm">{ok}</span>}
      </div>
    </div>
  );
}
