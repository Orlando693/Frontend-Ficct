import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { Materia, MateriaEstado } from "./types";

export default function MateriasTable({
  items,
  onEdit,
  onToggle,
}: {
  items: Materia[];
  onEdit: (m: Materia) => void;
  onToggle: (m: Materia, next: MateriaEstado) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow divide-y">
      <div className="px-4 py-3 text-sm text-slate-600">
        {items.length} materia(s)
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Créditos</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Sin resultados
                </td>
              </tr>
            )}
            {items.map((m) => {
              const next = m.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA";
              return (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${m.estado === "ACTIVA" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(m)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => onToggle(m, next)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-700 hover:bg-slate-50"
                        title={m.estado === "ACTIVA" ? "Inactivar" : "Activar"}
                      >
                        {m.estado === "ACTIVA"
                          ? <ToggleLeft className="w-4 h-4" />
                          : <ToggleRight className="w-4 h-4" />}
                        {m.estado === "ACTIVA" ? "Inactivar" : "Activar"}
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
