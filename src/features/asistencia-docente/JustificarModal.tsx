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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={(e)=>{e.preventDefault(); onSubmit({ justificacion });}}
        className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-6 space-y-4 ring-1 ring-slate-200"
      >
        <h3 className="text-lg font-semibold text-slate-900">Justificar ausencia</h3>
        <p className="text-sm text-slate-700">
          Explique brevemente el motivo. (La evidencia puede ser solicitada por Coordinación/CPD.)
        </p>
        <textarea
          value={justificacion}
          onChange={(e)=>setJustificacion(e.target.value)}
          placeholder="Ej.: Licencia médica / Comisión / Trámite académico…"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[110px] placeholder:text-slate-600 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm text-slate-900 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit" disabled={busy}
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
