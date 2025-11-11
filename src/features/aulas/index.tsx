"use client";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { Aula, AulaEstado, AulaTipo } from "./types";
import { listAulas, createAula, updateAula, setEstadoAula, deleteAula } from "./api";
import AulaModal from "./AulaModal";
import AulasTable from "./AulasTable";

export default function AulasFeature() {
  const [items, setItems] = useState<Aula[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todas" | AulaEstado>("todas");
  const [tipo, setTipo] = useState<"todos" | AulaTipo>("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Aula | null>(null);

  // Alto contraste
  const labelCls = "block text-sm text-slate-900 font-medium";
  const inputCls =
    "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
    "placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await listAulas({ q, estado, tipo });
      setItems(res.data);
    } catch (e: any) {
      setError(e.message || "Error al listar aulas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, tipo]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(a: Aula) {
    setEditing(a);
    setOpen(true);
  }

  async function save(values: {
    numero: string;
    tipo: AulaTipo;
    capacidad: number;
    piso: number | null;
  }) {
    try {
      setBusy(true);
      setError(null);
      if (editing) {
        await updateAula(editing.id, values);
      } else {
        await createAula(values);
      }
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(a: Aula, next: AulaEstado) {
    try {
      setError(null);
      await setEstadoAula(a.id, next);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo cambiar el estado");
    }
  }

  async function remove(a: Aula) {
    const ok = window.confirm(`¿Eliminar el aula ${a.numero}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      setError(null);
      await deleteAula(a.id);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo eliminar el aula");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Gestión de Aulas</h2>
          <p className="text-slate-800 text-sm">
            Crear, editar, activar/inactivar y listar aulas
            {loading ? " · Cargando…" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50"
        >
          <Plus className="w-4 h-4" />
          Nueva aula
        </button>
      </header>

      {/* Filtros responsivos */}
      <section className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código/ubicación…"
            className={"w-full pl-9 pr-3 py-2 " + inputCls}
            aria-label="Buscar"
          />
        </div>

        <label className="sr-only">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as any)}
          className={inputCls}
          aria-label="Estado"
        >
          <option value="todas">Todas</option>
          <option value="activo">Activas</option>
          <option value="inactivo">Inactivas</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>

        <label className="sr-only">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as any)}
          className={inputCls}
          aria-label="Tipo"
        >
          <option value="todos">Todos los tipos</option>
          <option value="teoria">Teoría</option>
          <option value="laboratorio">Laboratorio</option>
          <option value="auditorio">Auditorio</option>
        </select>
      </section>

      <AulasTable items={items} onEdit={openEdit} onToggle={toggle} onDelete={remove} loading={loading} />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-300">
          {error}
        </div>
      )}

      <AulaModal
        open={open}
        initial={
          editing
            ? {
                numero: editing.numero,
                tipo: editing.tipo as AulaTipo,
                capacidad: editing.capacidad,
                piso: editing.piso,
              }
            : undefined
        }
        onCancel={() => setOpen(false)}
        onSubmit={save}
        busy={busy}
      />
    </div>
  );
}
