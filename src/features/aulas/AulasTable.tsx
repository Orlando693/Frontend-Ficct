import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { Aula, AulaEstado } from "./types";

export default function AulasTable({
  items,
  onEdit,
  onToggle,
  onDelete,
  loading = false,
}: {
  items: Aula[];
  onEdit: (a: Aula) => void;
  onToggle: (a: Aula, next: AulaEstado) => void;
  onDelete: (a: Aula) => void;
  loading?: boolean;
}) {
  const SkeletonRow = () => (
    <tr className="border-t">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[140px] rounded bg-slate-200 animate-pulse" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 divide-y">
      <div className="px-4 py-3 text-sm text-slate-700">
        {items.length} aula(s)
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-900">
              <th className="text-left px-4 py-2 font-semibold">Código</th>
              <th className="text-left px-4 py-2 font-semibold">Tipo</th>
              <th className="text-left px-4 py-2 font-semibold">Capacidad</th>
              <th className="text-left px-4 py-2 font-semibold">Piso</th>
              <th className="text-left px-4 py-2 font-semibold">Estado</th>
              <th className="text-left px-4 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-700"
                >
                  Sin resultados
                </td>
              </tr>
            )}

            {!loading &&
              items.map((a) => {
                const next: AulaEstado =
                  a.estado === "activo" ? "inactivo" : "activo";

                const isActivo = a.estado === "activo";
                const isInactivo = a.estado === "inactivo";
                const isMantenimiento = a.estado === "mantenimiento";

                const editBtnCls =
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg " +
                  "bg-indigo-600 text-white hover:bg-indigo-700 " +
                  "focus:outline-none focus:ring-2 focus:ring-indigo-600/50 shadow-sm";

                const toggleBase =
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg " +
                  "text-white focus:outline-none focus:ring-2 shadow-sm";
                const toggleColor = isActivo
                  ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-600/50"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600/50";
                const toggleDisabled =
                  "bg-slate-400 cursor-not-allowed opacity-70 hover:bg-slate-400 focus:ring-0";

                return (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-2 font-semibold text-slate-900">
                      {a.numero}
                    </td>
                    <td className="px-4 py-2 capitalize">{a.tipo}</td>
                    <td className="px-4 py-2">{a.capacidad}</td>
                    <td className="px-4 py-2">{a.piso ?? "-"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActivo
                            ? "bg-emerald-100 text-emerald-800"
                            : isInactivo
                            ? "bg-slate-200 text-slate-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEdit(a)}
                          className={editBtnCls}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => onToggle(a, next)}
                          disabled={isMantenimiento}
                          className={`${toggleBase} ${
                            isMantenimiento ? toggleDisabled : toggleColor
                          }`}
                          title={isActivo ? "Inactivar" : "Activar"}
                          aria-label={isActivo ? "Inactivar" : "Activar"}
                        >
                          {isActivo ? (
                            <ToggleLeft className="w-4 h-4" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                          {isActivo ? "Inactivar" : "Activar"}
                        </button>

                        <button
                          onClick={() => onDelete(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600/50 shadow-sm"
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
