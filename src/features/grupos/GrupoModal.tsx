import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GestionDTO, MateriaMiniDTO, Turno } from "./types";

// FormState interno: "" para selects vacíos
type FormState = {
  gestion_id: number | "";
  materia_id: number | "";
  paralelo: string;
  turno: Turno | "";
  capacidad: number | "";
};

const emptyForm: FormState = {
  gestion_id: "",
  materia_id: "",
  paralelo: "",
  turno: "",
  capacidad: "",
};

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
  const [form, setForm] = useState<FormState>(initial ?? emptyForm);

  useEffect(() => {
    if (open) setForm(initial ?? emptyForm);
  }, [open, initial]);

  // Alto contraste
  const labelCls = "block text-sm text-slate-900 font-medium";
  const inputCls =
    "w-full rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
    "placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  const turnos: Turno[] = ["manana", "tarde", "noche"];

  const gestOpts = useMemo(
    () => gestiones.map((g) => ({ id: g.id_gestion, label: `${g.anio}-${g.periodo}` })),
    [gestiones]
  );
  const matOpts = useMemo(
    () => materias.map((m) => ({ id: m.id_materia, label: `${m.codigo} · ${m.nombre}` })),
    [materias]
  );

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
    <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl shadow-xl w-[95%] sm:w-[90%] max-w-2xl p-6 sm:p-7 space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          {initial ? "Editar grupo" : "Nuevo grupo"}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Gestión</label>
            <select
              value={form.gestion_id}
              onChange={(e) =>
                setForm((s) => ({ ...s, gestion_id: e.target.value ? Number(e.target.value) : "" }))
              }
              className={inputCls}
            >
              <option value="">Seleccione gestión</option>
              {gestOpts.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Materia</label>
            <select
              value={form.materia_id}
              onChange={(e) =>
                setForm((s) => ({ ...s, materia_id: e.target.value ? Number(e.target.value) : "" }))
              }
              className={inputCls}
            >
              <option value="">Seleccione materia</option>
              {matOpts.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Paralelo</label>
            <input
              value={form.paralelo}
              onChange={(e) => setForm((s) => ({ ...s, paralelo: e.target.value }))}
              placeholder="A"
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Turno</label>
            <select
              value={form.turno}
              onChange={(e) => setForm((s) => ({ ...s, turno: e.target.value as Turno }))}
              className={inputCls}
            >
              <option value="">Seleccione turno</option>
              {turnos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Cupo</label>
            <input
              type="number"
              min={1}
              value={form.capacidad}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  capacidad: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              placeholder="40"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
          {/* Cancelar: texto blanco + fondo oscuro para que no se camufle */}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50 disabled:opacity-80"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
