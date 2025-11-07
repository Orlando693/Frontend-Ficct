"use client";
import { useState } from "react";
import { CalendarDays, SlidersHorizontal, NotebookTabs, Upload } from "lucide-react";
import Periodos from "./periodos";
import Parametros from "./parametros";
import PlanEstudios from "./plan-estudios";   // si aún no lo tienes, puedes comentar esta línea y el tab
import ImportarOferta from "./importar";      // 👈 nueva pestaña

export default function GestionAcademica() {
  const [tab, setTab] = useState<"periodos" | "parametros" | "plan" | "importar">("periodos");

  const tabBase = "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm";
  const tabActive = "bg-slate-900 text-white border-slate-900";
  const tabIdle = "border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Gestión Académica</h1>
        <p className="text-slate-600">Periodos, parámetros, plan de estudios e importación de oferta.</p>
      </header>

      <nav className="flex gap-2 flex-wrap">
        <button className={`${tabBase} ${tab === "periodos" ? tabActive : tabIdle}`} onClick={() => setTab("periodos")}>
          <CalendarDays className="w-4 h-4" /> Periodos
        </button>
        <button className={`${tabBase} ${tab === "parametros" ? tabActive : tabIdle}`} onClick={() => setTab("parametros")}>
          <SlidersHorizontal className="w-4 h-4" /> Parámetros
        </button>
        <button className={`${tabBase} ${tab === "plan" ? tabActive : tabIdle}`} onClick={() => setTab("plan")}>
          <NotebookTabs className="w-4 h-4" /> Plan de estudios
        </button>
        <button className={`${tabBase} ${tab === "importar" ? tabActive : tabIdle}`} onClick={() => setTab("importar")}>
          <Upload className="w-4 h-4" /> Importar oferta
        </button>
      </nav>

      {tab === "periodos"   ? <Periodos />
       : tab === "parametros" ? <Parametros />
       : tab === "plan"       ? <PlanEstudios />
       :                        <ImportarOferta />}
    </div>
  );
}
