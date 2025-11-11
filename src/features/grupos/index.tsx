"use client";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { GestionDTO, Grupo, GrupoEstado, MateriaMiniDTO, Turno } from "./types";
import {
  listGrupos, listGestiones, listMateriasActivas,
  createGrupo, updateGrupo, setEstadoGrupo, deleteGrupo
} from "./api";
import GrupoModal from "./GrupoModal";
import GruposTable from "./GruposTable";

export default function GruposFeature() {
  const [items, setItems] = useState<Grupo[]>([]);
  const [gestiones, setGestiones] = useState<GestionDTO[]>([]);
  const [materias, setMaterias] = useState<MateriaMiniDTO[]>([]);

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | GrupoEstado>("todos");
  const [gestionId, setGestionId] = useState<number | "">("");
  const [materiaId, setMateriaId] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Grupo | null>(null);

  const inputCls =
    "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
    "placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  async function loadCatalogs() {
    try {
      const [gs, ms] = await Promise.all([listGestiones(), listMateriasActivas()]);
      setGestiones(gs);
      setMaterias(ms);
    } catch (e: any) {
      setError(e.message || "Error cargando catálogos");
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await listGrupos({
        q,
        estado,
        gestion_id: gestionId ? Number(gestionId) : undefined,
        materia_id: materiaId ? Number(materiaId) : undefined,
      });
      setItems(res.data);
    } catch (e: any) {
      setError(e.message || "Error al listar grupos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCatalogs(); }, []);
  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q, estado, gestionId, materiaId]);

  function openCreate() { setEditing(null); setOpen(true); }
  function openEdit(g: Grupo) { setEditing(g); setOpen(true); }

  async function save(values: {
    gestion_id: number; materia_id: number; paralelo: string; turno: Turno; capacidad: number;
  }) {
    try {
      setBusy(true);
      setError(null);
      if (editing) await updateGrupo(editing.id, values);
      else await createGrupo(values);
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(g: Grupo, next: GrupoEstado) {
    try {
      setError(null);
      await setEstadoGrupo(g.id, next);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo cambiar el estado");
    }
  }

  async function remove(g: Grupo) {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`¿Eliminar el grupo ${g.materia_label} - ${g.paralelo}?`);
      if (!confirmed) return;
    }
    try {
      setError(null);
      await deleteGrupo(g.id);
      fetchData();
    } catch (e: any) {
      setError(e.message || "No se pudo eliminar el grupo");
    }
  }

  return (
    <div className="space-y-4 text-slate-900">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Grupos</h2>
          <p className="text-slate-800 text-sm">
            Crear, editar, activar/inactivar y listar grupos
            {loading ? " · Cargando…" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50"
        >
          <Plus className="w-4 h-4" />
          Nuevo grupo
        </button>
      </header>

      {/* Filtros – responsive */}
      <section className="grid gap-3 md:grid-cols-[1fr_220px_220px_220px]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por materia/paralelo…"
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
          <option value="todos">Todos</option>
          <option value="ACTIVO">ACTIVOS</option>
          <option value="INACTIVO">INACTIVOS</option>
        </select>

        <label className="sr-only">Gestión</label>
        <select
          value={gestionId}
          onChange={(e) => setGestionId(e.target.value ? Number(e.target.value) : "")}
          className={inputCls}
          aria-label="Gestión"
        >
          <option value="">Gestión</option>
          {gestiones.map((g) => (
            <option key={g.id_gestion} value={g.id_gestion}>
              {g.anio}-{g.periodo}
            </option>
          ))}
        </select>

        <label className="sr-only">Materia</label>
        <select
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : "")}
          className={inputCls}
          aria-label="Materia"
        >
          <option value="">Materia</option>
          {materias.map((m) => (
            <option key={m.id_materia} value={m.id_materia}>
              {m.codigo} · {m.nombre}
            </option>
          ))}
        </select>
      </section>

      <GruposTable items={items} loading={loading} onEdit={openEdit} onToggle={toggle} onDelete={remove} />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <GrupoModal
        open={open}
        gestiones={gestiones}
        materias={materias}
        initial={
          editing
            ? {
                gestion_id: editing.gestion_id,
                materia_id: editing.materia_id,
                paralelo: editing.paralelo,
                turno: editing.turno,
                capacidad: editing.capacidad,
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
