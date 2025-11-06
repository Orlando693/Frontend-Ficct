import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { Aula, AulaEstado } from "./types";

export default function AulasTable({
  items,
  onEdit,
  onToggle,
}: {
  items: Aula[];
  onEdit: (a: Aula) => void;
  onToggle: (a: Aula, next: AulaEstado) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow divide-y">
      <div className="px-4 py-3 text-sm text-slate-600">{items.length} aula(s)</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Capacidad</th>
              <th className="text-left px-4 py-2">Piso</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin resultados</td>
              </tr>
            )}
            {items.map((a) => {
              const next: AulaEstado =
                a.estado === "activo" ? "inactivo" : "activo";
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{a.numero}</td>
                  <td className="px-4 py-2 capitalize">{a.tipo}</td>
                  <td className="px-4 py-2">{a.capacidad}</td>
                  <td className="px-4 py-2">{a.piso ?? "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        a.estado === "activo"
                          ? "bg-green-100 text-green-700"
                          : a.estado === "inactivo"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => onToggle(a, next)}
                        disabled={a.estado === "mantenimiento"}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        title={a.estado === "activo" ? "Inactivar" : "Activar"}
                      >
                        {a.estado === "activo" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        {a.estado === "activo" ? "Inactivar" : "Activar"}
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
