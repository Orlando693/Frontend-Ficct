"use client";
import { useEffect, useMemo, useState } from "react";
import { Upload, FileDown, Eye, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { listGestiones } from "./api.gestiones";
import type { Gestion, GestionDTO } from "./types";
import { dtoToGestion } from "./types";
import { downloadPlantillaURL, serverPreview, serverConfirm } from "./api.importar";
import type { PreviewRow, PreviewSummary } from "./types.importar";

const labelCls = "block text-sm text-slate-800";
const inputCls =
  "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
  "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

// columnas mínimas del CSV
const REQUIRED_COLS = ["carrera_sigla", "materia_codigo", "paralelo", "turno", "capacidad"] as const;
type MinCols = typeof REQUIRED_COLS[number];

export default function ImportarOferta() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionId, setGestionId] = useState<number | "">("");

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [totals, setTotals] = useState<PreviewSummary>({ total: 0, ok: 0, warn: 0, error: 0 });

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await listGestiones();
        const dtos = (data as unknown as GestionDTO[]);
        setGestiones(dtos.map(dtoToGestion));
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar las gestiones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const plantillaCSV = useMemo(() => {
    const header = REQUIRED_COLS.join(",");
    const sample = ["SIS,INF-121,A,manana,40","SIS,INF-131,B,tarde,35"].join("\n");
    return header + "\n" + sample + "\n";
  }, []);

  function downloadPlantillaLocal() {
    const blob = new Blob([plantillaCSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla_oferta.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setRows([]); setTotals({ total: 0, ok: 0, warn: 0, error: 0 });
    setError(null); setOk(null);
  }

  async function localPreviewCSV(f: File) {
    const text = await f.text();
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) throw new Error("El archivo está vacío.");
    const header = lines[0].split(",").map(s => s.trim());
    const missing = REQUIRED_COLS.filter(c => !header.includes(c));
    if (missing.length) throw new Error(`Faltan columnas: ${missing.join(", ")}`);

    const idx: Record<string, number> = {};
    header.forEach((h, i) => (idx[h] = i));

    const out: PreviewRow[] = [];
    let ok = 0, warn = 0, err = 0;

    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1;
      const cols = lines[i].split(",").map(s => s.trim());
      const record: Record<string, string> = {};
      for (const c of REQUIRED_COLS) record[c] = cols[idx[c]] ?? "";

      let status: "ok" | "warn" | "error" = "ok";
      let message: string | undefined;

      if (!record.carrera_sigla || !record.materia_codigo || !record.paralelo) {
        status = "error"; message = "Campos obligatorios vacíos (carrera_sigla, materia_codigo, paralelo).";
      } else if (!["manana", "tarde", "noche"].includes(record.turno)) {
        status = "error"; message = "turno inválido (usa: manana|tarde|noche).";
      } else if (!/^\d+$/.test(record.capacidad)) {
        status = "error"; message = "capacidad debe ser numérica.";
      } else if (Number(record.capacidad) <= 0) {
        status = "error"; message = "capacidad debe ser > 0.";
      }

      switch (status) {
        case "ok": ok++; break;
        case "warn": warn++; break;
        case "error": err++; break;
      }

      out.push({ rowNum, data: record, status, message });
    }

    setRows(out);
    setTotals({ total: out.length, ok, warn, error: err });
  }

  async function doPreview() {
    try {
      setBusy(true); setError(null); setOk(null);
      if (!file) throw new Error("Selecciona un archivo.");
      if (typeof gestionId !== "number") throw new Error("Selecciona una gestión.");

      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "csv") {
        await localPreviewCSV(file);
      } else {
        const { data } = await serverPreview(file, Number(gestionId));
        setRows(data.rows);
        setTotals(data.totals);
      }
    } catch (e:any) {
      setError(e.message || "No se pudo previsualizar");
    } finally {
      setBusy(false);
    }
  }

  async function doConfirm() {
    try {
      setBusy(true); setError(null); setOk(null);
      if (!file) throw new Error("Selecciona un archivo.");
      if (typeof gestionId !== "number") throw new Error("Selecciona una gestión.");
      if (totals.error > 0) throw new Error("Hay filas con error. Corrige antes de importar.");

      const { data } = await serverConfirm(file, Number(gestionId));
      setOk(`Importación OK · insertados: ${data.inserted}, actualizados: ${data.updated}, omitidos: ${data.skipped}, errores: ${data.errors}`);
    } catch (e:any) {
      setError(e.message || "No se pudo confirmar la importación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Importar maestro de oferta</h2>
        <p className="text-slate-700 text-sm">CSV/XLSX con columnas mínimas. Vista previa antes de confirmar.</p>
      </header>

      {/* Guía + plantilla */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-slate-800" /> Plantilla y columnas mínimas
        </h3>
        <ul className="list-disc pl-5 text-sm text-slate-800">
          <li><span className="font-medium">Columnas:</span> <code className="text-slate-800">carrera_sigla, materia_codigo, paralelo, turno, capacidad</code></li>
          <li><span className="font-medium">turno:</span> <code className="text-slate-800">manana | tarde | noche</code></li>
          <li><span className="font-medium">capacidad:</span> entero &gt; 0</li>
          <li>La <span className="font-medium">gestión</span> se selecciona aquí (no va en el archivo).</li>
        </ul>
        <div className="flex gap-2">
          <button onClick={downloadPlantillaLocal} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100">
            <FileDown className="w-4 h-4 text-slate-800" /> Descargar plantilla CSV
          </button>
        </div>
      </section>

      {/* Selección gestión + archivo */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Gestión</label>
          {loading ? (
            <div className="h-10 rounded bg-neutral-900 animate-pulse" />
          ) : (
            <select
              value={gestionId}
              onChange={(e)=>setGestionId(e.target.value===""? "": Number(e.target.value))}
              className={inputCls}
            >
              <option value="">— Selecciona —</option>
              {gestiones.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          )}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className={labelCls}>Archivo (CSV/XLSX)</label>
          <input type="file" accept=".csv,.xlsx" onChange={onFileChange} className={inputCls} placeholder="Selecciona tu archivo…" />
          <p className="text-xs text-slate-600">Para XLSX, la vista previa se genera en el servidor.</p>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={doPreview}
          disabled={busy || !file || typeof gestionId !== "number"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 disabled:opacity-50"
        >
          <Eye className="w-4 h-4 text-slate-800" /> Previsualizar
        </button>
        <button
          onClick={doConfirm}
          disabled={busy || !file || totals.total === 0 || totals.error > 0 || typeof gestionId !== "number"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />} <CheckCircle2 className="w-4 h-4 text-white" /> Confirmar importación
        </button>
      </div>

      {/* Resumen */}
      {(totals.total > 0) && (
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1 text-slate-800"><Eye className="w-4 h-4 text-slate-800" /> {totals.total} filas</span>
          <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="w-4 h-4 text-green-700" /> OK: {totals.ok}</span>
          <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="w-4 h-4 text-amber-700" /> Advertencias: {totals.warn}</span>
          <span className="inline-flex items-center gap-1 text-red-700"><XCircle className="w-4 h-4 text-red-700" /> Errores: {totals.error}</span>
        </div>
      )}

      {/* Tabla preview */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="text-left px-4 py-2 font-semibold">#</th>
                {REQUIRED_COLS.map(c => <th key={c} className="text-left px-4 py-2 font-semibold">{c}</th>)}
                <th className="text-left px-4 py-2 font-semibold">Estado</th>
                <th className="text-left px-4 py-2 font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {rows.map(r => (
                <tr key={r.rowNum} className="border-t">
                  <td className="px-4 py-2">{r.rowNum}</td>
                  {REQUIRED_COLS.map(c => <td key={c} className="px-4 py-2">{r.data[c] ?? ""}</td>)}
                  <td className="px-4 py-2">
                    {r.status === "ok"    && <span className="text-green-700">OK</span>}
                    {r.status === "warn"  && <span className="text-amber-700">ADVERTENCIA</span>}
                    {r.status === "error" && <span className="text-red-700">ERROR</span>}
                  </td>
                  <td className="px-4 py-2 text-slate-700">{r.message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensajes */}
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {ok && <div className="p-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{ok}</div>}
    </div>
  );
}
