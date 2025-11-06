import { Loader2 } from "lucide-react";
import { useState } from "react";

type FormState = { codigo: string; nombre: string; creditos: number };

export default function MateriaModal({
  open,
  initial,
  onCancel,
  onSubmit,
  busy = false,
}: {
  open: boolean;
  initial?: FormState;
  onCancel: () => void;
  onSubmit: (values: FormState) => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<FormState>(
    initial ?? { codigo: "", nombre: "", creditos: 5 }
  );

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, creditos: Number(form.creditos) || 0 });
  }

  const labelCls = "block text-sm text-slate-600";
  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-800">
          {initial ? "Editar materia" : "Nueva materia"}
        </h3>

        <div className="space-y-2">
          <label className={labelCls}>Código</label>
          <input
            value={form.codigo}
            onChange={(e) => setForm((s) => ({ ...s, codigo: e.target.value }))}
            placeholder="INF-121"
            className={inputCls}
          />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Programación I"
            className={inputCls}
          />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Créditos</label>
          <input
            type="number"
            min={0}
            max={20}
            value={form.creditos}
            onChange={(e) => setForm((s) => ({ ...s, creditos: Number(e.target.value) }))}
            placeholder="0–20"
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
