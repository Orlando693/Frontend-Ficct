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
        className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold">Justificar ausencia</h3>
        <p className="text-sm text-slate-600">
          Explique brevemente el motivo. (La evidencia puede ser solicitada por Coordinación/CPD.)
        </p>
        <textarea
          value={justificacion}
          onChange={(e)=>setJustificacion(e.target.value)}
          placeholder="Ej.: Licencia médica / Comisión / Trámite académico…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 min-h-[100px] placeholder:text-slate-400 text-slate-800"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm">
            Cancelar
          </button>
          <button
            type="submit" disabled={busy}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
