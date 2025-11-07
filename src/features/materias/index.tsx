"use client";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { Materia, MateriaEstado } from "./types";
import {
  listMaterias,
  createMateria,
  updateMateria,
  setEstadoMateria,
} from "./api";
import MateriasTable from "./MateriasTable";
import MateriaModal from "./MateriaModal";

export default function MateriasFeature() {
  const [items, setItems] = useState<Materia[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todas" | MateriaEstado>("todas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await listMaterias({ q, estado });
      setItems(res.data);
    } catch (e: any) {
      setError(e.message || "Error al listar materias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(m: Materia) {
    setEditing(m);
    setOpen(true);
  }

  async function save(values: {
    codigo: string;
    nombre: string;
    creditos: number;
  }) {
    try {
      setBusy(true);
      setError(null);
      if (editing) {
        await updateMateria(editing.id, values);
      } else {
        await createMateria(values);
      }
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(m: Materia, next: MateriaEstado) {
    try {
      setError(null);
      await setEstadoMateria(m.id, next);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo cambiar el estado");
    }
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Materias</h2>
          <p className="text-slate-700 text-sm">
            Crear, editar, activar/inactivar y listar materias.
            {loading ? " Cargando…" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Plus className="w-4 h-4" />
          Nueva materia
        </button>
      </header>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código o nombre…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-800 placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as any)}
            className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="todas">Todas</option>
            <option value="ACTIVA">ACTIVAS</option>
            <option value="INACTIVA">INACTIVAS</option>
          </select>
        </div>
      </section>

      <MateriasTable
        items={items}
        loading={loading}
        onEdit={openEdit}
        onToggle={toggle}
      />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <MateriaModal
        open={open}
        initial={
          editing
            ? {
                codigo: editing.codigo,
                nombre: editing.nombre,
                creditos: editing.creditos,
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
