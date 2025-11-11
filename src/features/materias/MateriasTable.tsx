import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { Materia, MateriaEstado } from "./types";

export default function MateriasTable({
  items,
  onEdit,
  onToggle,
  onDelete,
  loading = false,
}: {
  items: Materia[];
  onEdit: (m: Materia) => void;
  onToggle: (m: Materia, next: MateriaEstado) => void;
  onDelete: (m: Materia) => void;
  loading?: boolean;
}) {
  // Skeletons grises (visibles en fondo blanco)
  const SkeletonRow = ({ i }: { i: number }) => (
    <tr key={`skeleton-${i}`} className="border-t">
      <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-slate-500 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-52 rounded bg-slate-500 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-12 rounded bg-slate-500 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-6 w-24 rounded-full bg-slate-600 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-8 w-40 rounded-xl bg-slate-500 animate-pulse" /></td>
    </tr>
  );

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 text-slate-900">
      <div className="px-4 py-3 text-sm text-slate-800">
        {items.length} materia(s)
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left px-4 py-2 font-semibold">Código</th>
              <th className="text-left px-4 py-2 font-semibold">Nombre</th>
              <th className="text-left px-4 py-2 font-semibold">Créditos</th>
              <th className="text-left px-4 py-2 font-semibold">Estado</th>
              <th className="text-left px-4 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-slate-50">
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow i={i} key={i} />)}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-800">
                  Sin resultados
                </td>
              </tr>
            )}

            {!loading && items.map((m) => {
              const next: MateriaEstado = m.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA";
              const toggleLabel = m.estado === "ACTIVA" ? "Inactivar" : "Activar";
              const ToggleIcon = m.estado === "ACTIVA" ? ToggleLeft : ToggleRight;

              return (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        m.estado === "ACTIVA"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-900"
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onEdit(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => onToggle(m, next)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white focus-visible:outline-none focus-visible:ring-2 ${
                          m.estado === "ACTIVA"
                            ? "bg-amber-700 hover:bg-amber-600 focus-visible:ring-amber-700/40"
                            : "bg-emerald-700 hover:bg-emerald-600 focus-visible:ring-emerald-700/40"
                        }`}
                        title={toggleLabel}
                        aria-label={toggleLabel}
                      >
                        <ToggleIcon className="w-4 h-4" />
                        {toggleLabel}
                      </button>

                      <button
                        onClick={() => onDelete(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700/40"
                        title="Eliminar"
                        aria-label="Eliminar"
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
