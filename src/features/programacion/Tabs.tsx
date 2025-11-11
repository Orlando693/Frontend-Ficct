import { NavLink } from "react-router-dom";
import { CalendarRange, Sparkles, Search } from "lucide-react";

const base = "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors";
const active = "bg-slate-900 text-white border-slate-900";
const normal = "border-slate-300 text-slate-800 hover:bg-slate-50";

export default function ProgramacionTabs() {
  return (
    // responsive: wrap en pantallas chicas
    <div className="flex gap-2 flex-wrap">
      <NavLink
        to="/jefatura/programacion"
        className={({ isActive }) => `${base} ${isActive ? active : normal}`}
      >
        <CalendarRange className="w-4 h-4" />
        Manual
      </NavLink>

      <NavLink
        to="/jefatura/programacion/auto"
        className={({ isActive }) => `${base} ${isActive ? active : normal}`}
      >
        <Sparkles className="w-4 h-4" />
        Automática
      </NavLink>

      <NavLink
        to="/jefatura/programacion/disponibilidad"
        className={({ isActive }) => `${base} ${isActive ? active : normal}`}
      >
        <Search className="w-4 h-4" />
        Disponibilidad
      </NavLink>
    </div>
  );
}
