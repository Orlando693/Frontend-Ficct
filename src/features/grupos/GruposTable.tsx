import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { Grupo, GrupoEstado } from "./types";

export default function GruposTable({
  items,
  onEdit,
  onToggle,
}: {
  items: Grupo[];
  onEdit: (g: Grupo) => void;
  onToggle: (g: Grupo, next: GrupoEstado) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow divide-y">
      <div className="px-4 py-3 text-sm text-slate-600">
        {items.length} grupo(s)
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Gestión</th>
              <th className="text-left px-4 py-2">Materia</th>
              <th className="text-left px-4 py-2">Paralelo</th>
              <th className="text-left px-4 py-2">Turno</th>
              <th className="text-left px-4 py-2">Cupo</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Sin resultados
                </td>
              </tr>
            )}
            {items.map((g) => {
              const next: GrupoEstado = g.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
              return (
                <tr key={g.id} className="border-t">
                  <td className="px-4 py-2">{g.gestion_label}</td>
                  <td className="px-4 py-2">{g.materia_label}</td>
                  <td className="px-4 py-2 font-medium">{g.paralelo}</td>
                  <td className="px-4 py-2">{g.turno}</td>
                  <td className="px-4 py-2">{g.capacidad}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${g.estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {g.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(g)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => onToggle(g, next)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title={g.estado === "ACTIVO" ? "Inactivar" : "Activar"}
                      >
                        {g.estado === "ACTIVO" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        {g.estado === "ACTIVO" ? "Inactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
