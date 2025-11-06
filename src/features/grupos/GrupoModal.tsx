import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { GestionDTO, MateriaMiniDTO, Turno } from "./types";

// FormState (interno del modal): con "" para manejar selects vacíos
type FormState = {
  gestion_id: number | "";
  materia_id: number | "";
  paralelo: string;
  turno: Turno | "";
  capacidad: number | "";
};

// Payload que el padre recibe (normalizado)
export type GrupoSubmitPayload = {
  gestion_id: number;
  materia_id: number;
  paralelo: string;
  turno: Turno;
  capacidad: number;
};

export default function GrupoModal({
  open,
  gestiones,
  materias,
  initial,
  onCancel,
  onSubmit,
  busy = false,
}: {
  open: boolean;
  gestiones: GestionDTO[];
  materias: MateriaMiniDTO[];
  initial?: FormState;
  onCancel: () => void;
  onSubmit: (values: GrupoSubmitPayload) => void | Promise<void>;
  busy?: boolean;
}) {
  // 🔧 Hooks SIEMPRE se llaman (nunca antes de un return)
  const [form, setForm] = useState<FormState>(
    initial ?? { gestion_id: "", materia_id: "", paralelo: "", turno: "", capacidad: "" }
  );

  const labelCls = "block text-sm text-slate-600";
  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

  const turnos: Turno[] = ["manana", "tarde", "noche"];

  const gestOpts = useMemo(
    () => gestiones.map(g => ({ id: g.id_gestion, label: `${g.anio}-${g.periodo}` })),
    [gestiones]
  );
  const matOpts = useMemo(
    () => materias.map(m => ({ id: m.id_materia, label: `${m.codigo} · ${m.nombre}` })),
    [materias]
  );

  // ✅ El guard va después de TODOS los hooks
  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      form.gestion_id !== "" &&
      form.materia_id !== "" &&
      form.paralelo.trim() &&
      form.turno !== "" &&
      form.capacidad !== ""
    ) {
      const payload: GrupoSubmitPayload = {
        gestion_id: Number(form.gestion_id),
        materia_id: Number(form.materia_id),
        paralelo: form.paralelo.trim(),
        turno: form.turno as Turno,
        capacidad: Number(form.capacidad),
      };
      await onSubmit(payload);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {initial ? "Editar grupo" : "Nuevo grupo"}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Gestión</label>
            <select
              value={form.gestion_id}
              onChange={(e) => setForm(s => ({ ...s, gestion_id: e.target.value ? Number(e.target.value) : "" }))}
              className={inputCls}
            >
              <option value="">{/* placeholder */}Seleccione gestión</option>
              {gestOpts.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Materia</label>
            <select
              value={form.materia_id}
              onChange={(e) => setForm(s => ({ ...s, materia_id: e.target.value ? Number(e.target.value) : "" }))}
              className={inputCls}
            >
              <option value="">{/* placeholder */}Seleccione materia</option>
              {matOpts.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Paralelo</label>
            <input
              value={form.paralelo}
              onChange={(e) => setForm(s => ({ ...s, paralelo: e.target.value }))}
              placeholder="A"
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Turno</label>
            <select
              value={form.turno}
              onChange={(e) => setForm(s => ({ ...s, turno: e.target.value as Turno }))}
              className={inputCls}
            >
              <option value="">{/* placeholder */}Seleccione turno</option>
              {turnos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Cupo</label>
            <input
              type="number"
              min={1}
              value={form.capacidad}
              onChange={(e) => setForm(s => ({ ...s, capacidad: e.target.value === "" ? "" : Number(e.target.value) }))}
              placeholder="40"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
