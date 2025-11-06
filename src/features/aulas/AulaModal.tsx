import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { AulaTipo } from "./types";

type FormState = {
  numero: string;
  tipo: AulaTipo | "";
  capacidad: number | "";
  piso: number | "" | null;
};

export type AulaSubmitPayload = {
  numero: string;
  tipo: AulaTipo;
  capacidad: number;
  piso: number | null;
};

export default function AulaModal({
  open,
  initial,
  onCancel,
  onSubmit,
  busy = false,
}: {
  open: boolean;
  initial?: FormState;
  onCancel: () => void;
  onSubmit: (values: AulaSubmitPayload) => void | Promise<void>;
  busy?: boolean;
}) {
  const [form, setForm] = useState<FormState>(
    initial ?? { numero: "", tipo: "", capacidad: "", piso: null }
  );

  const labelCls = "block text-sm text-slate-600";
  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.numero.trim() && form.tipo && form.capacidad !== "") {
      const payload: AulaSubmitPayload = {
        numero: form.numero.trim(),
        tipo: form.tipo as AulaTipo,
        capacidad: Number(form.capacidad),
        piso: form.piso === "" ? null : (form.piso as number | null),
      };
      onSubmit(payload);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {initial ? "Editar aula" : "Nueva aula"}
        </h3>

        <div className="space-y-2">
          <label className={labelCls}>Código / Número</label>
          <input
            value={form.numero}
            onChange={(e) => setForm(s => ({ ...s, numero: e.target.value }))}
            placeholder="A-101"
            className={inputCls}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm(s => ({ ...s, tipo: e.target.value as AulaTipo }))}
              className={inputCls}
            >
              <option value="">{/* placeholder */}Seleccione tipo</option>
              <option value="teoria">Teoría</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="auditorio">Auditorio</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Capacidad</label>
            <input
              type="number"
              min={1}
              value={form.capacidad}
              onChange={(e) =>
                setForm(s => ({ ...s, capacidad: e.target.value === "" ? "" : Number(e.target.value) }))
              }
              placeholder="60"
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Piso (opcional)</label>
          <input
            type="number"
            value={form.piso ?? ""}
            onChange={(e) =>
              setForm(s => ({
                ...s,
                piso: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            placeholder="1"
            className={inputCls}
          />
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
