import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function JustificarModal({
  open, onCancel, onSubmit, busy=false
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { justificacion: string }) => void;
  busy?: boolean;
}) {
  const [justificacion, setJustificacion] = useState("");

  if (!open) return null;

  const label =
    "block text-sm text-slate-800 font-medium";
  const input =
    "w-full rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ justificacion });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-6 space-y-4 ring-1 ring-slate-200"
      >
        <h3 className="text-lg font-semibold text-slate-900">Justificar ausencia</h3>
        <p className="text-sm text-slate-700">
          Explique brevemente el motivo. (La evidencia puede ser solicitada por Coordinación/CPD.)
        </p>

        <div className="space-y-2">
          <label className={label}>Justificación</label>
          <textarea
            value={justificacion}
            onChange={(e)=>setJustificacion(e.target.value)}
            placeholder="Ej.: Licencia médica / Comisión / Trámite académico…"
            className={`${input} min-h-[110px]`}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
          {/* Cancelar: fondo oscuro + texto blanco */}
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
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
