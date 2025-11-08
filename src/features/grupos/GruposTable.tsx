import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { Grupo, GrupoEstado } from "./types";

export default function GruposTable({
  items,
  onEdit,
  onToggle,
  onDelete,
  loading = false,
}: {
  items: Grupo[];
  onEdit: (g: Grupo) => void;
  onToggle: (g: Grupo, next: GrupoEstado) => void;
  onDelete: (g: Grupo) => void;
  loading?: boolean;
}) {
  const SkeletonRow = ({ i }: { i: number }) => (
    <tr key={`skeleton-${i}`} className="border-t">
      {Array.from({ length: 7 }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div
            className={
              "h-3 rounded animate-pulse " +
              (idx === 6 ? "h-8 w-40 rounded-xl bg-neutral-800/30" : "w-24 bg-neutral-800/30")
            }
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="bg-white rounded-2xl shadow border text-slate-800">
      <div className="px-4 py-3 text-sm text-slate-700">
        {items.length} grupo(s)
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left px-4 py-2 font-semibold">Gestión</th>
              <th className="text-left px-4 py-2 font-semibold">Materia</th>
              <th className="text-left px-4 py-2 font-semibold">Paralelo</th>
              <th className="text-left px-4 py-2 font-semibold">Turno</th>
              <th className="text-left px-4 py-2 font-semibold">Cupo</th>
              <th className="text-left px-4 py-2 font-semibold">Estado</th>
              <th className="text-left px-4 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-slate-50">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow i={i} key={i} />)}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-600">
                  Sin resultados
                </td>
              </tr>
            )}

            {!loading &&
              items.map((g) => {
                const next: GrupoEstado = g.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
                const toggleLabel = g.estado === "ACTIVO" ? "Inactivar" : "Activar";
                const ToggleIcon = g.estado === "ACTIVO" ? ToggleLeft : ToggleRight;

                return (
                  <tr key={g.id} className="border-t">
                    <td className="px-4 py-2">{g.gestion_label}</td>
                    <td className="px-4 py-2">{g.materia_label}</td>
                    <td className="px-4 py-2 font-medium">{g.paralelo}</td>
                    <td className="px-4 py-2">{g.turno}</td>
                    <td className="px-4 py-2">{g.capacidad}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          g.estado === "ACTIVO"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {g.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEdit(g)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" /> Editar
                        </button>

                        <button
                          onClick={() => onToggle(g, next)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white focus:outline-none focus:ring-2 ${
                            g.estado === "ACTIVO"
                              ? "bg-amber-700 hover:bg-amber-600 focus:ring-amber-300"
                              : "bg-emerald-700 hover:bg-emerald-600 focus:ring-emerald-300"
                          }`}
                          title={toggleLabel}
                        >
                          <ToggleIcon className="w-4 h-4" />
                          {toggleLabel}
                        </button>

                        <button
                          onClick={() => onDelete(g)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
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
