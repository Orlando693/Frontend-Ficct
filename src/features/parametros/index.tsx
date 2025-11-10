"use client";
import { useState } from "react";
import { CalendarDays, SlidersHorizontal, NotebookTabs, Upload } from "lucide-react";
import Periodos from "./periodos";
import Parametros from "./parametros";
import PlanEstudios from "./plan-estudios";
import ImportarOferta from "./importar";

export default function GestionAcademica() {
  const [tab, setTab] = useState<"periodos" | "parametros" | "plan" | "importar">("periodos");

  const tabBase  = "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors";
  const tabActive= "bg-slate-900 text-white border-slate-900";
  const tabIdle  = "border-slate-300 text-slate-800 hover:bg-slate-100";

  const Btn = ({
    active, onClick, children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button className={`${tabBase} ${active ? tabActive : tabIdle}`} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Gestión Académica</h1>
        <p className="text-slate-700">Periodos, parámetros, plan de estudios e importación de oferta.</p>
      </header>

      <nav className="flex gap-2 flex-wrap">
        <Btn active={tab==="periodos"} onClick={()=>setTab("periodos")}>
          <CalendarDays className="w-4 h-4 text-current" /> Periodos
        </Btn>
        <Btn active={tab==="parametros"} onClick={()=>setTab("parametros")}>
          <SlidersHorizontal className="w-4 h-4 text-current" /> Parámetros
        </Btn>
        <Btn active={tab==="plan"} onClick={()=>setTab("plan")}>
          <NotebookTabs className="w-4 h-4 text-current" /> Plan de estudios
        </Btn>
        <Btn active={tab==="importar"} onClick={()=>setTab("importar")}>
          <Upload className="w-4 h-4 text-current" /> Importar oferta
        </Btn>
      </nav>

      {tab === "periodos"   ? <Periodos />
       : tab === "parametros" ? <Parametros />
       : tab === "plan"       ? <PlanEstudios />
       :                        <ImportarOferta />}
    </div>
  );
}
