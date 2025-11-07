"use client";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { GestionDTO, Grupo, GrupoEstado, MateriaMiniDTO, Turno } from "./types";
import {
  listGrupos, listGestiones, listMateriasActivas,
  createGrupo, updateGrupo, setEstadoGrupo
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

  const labelCls = "block text-sm text-slate-600";
  const inputCls =
    "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

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
  useEffect(() => { fetchData(); }, [q, estado, gestionId, materiaId]);

  function openCreate() { setEditing(null); setOpen(true); }
  function openEdit(g: Grupo) { setEditing(g); setOpen(true); }

  async function save(values: {
    gestion_id: number; materia_id: number; paralelo: string; turno: Turno; capacidad: number;
  }) {
    try {
      setBusy(true);
      setError(null);
      if (editing) {
        await updateGrupo(editing.id, values);
      } else {
        await createGrupo(values);
      }
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

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Grupos</h2>
          <p className="text-slate-600 text-sm">
            Crear, editar, activar/inactivar y listar grupos {loading ? " · Cargando…" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Nuevo grupo
        </button>
      </header>

      <section className="grid lg:grid-cols-[1fr_220px_220px_220px] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por materia/paralelo…"
            className={"w-full pl-9 pr-3 py-2 " + inputCls}
          />
        </div>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as any)}
          className={inputCls}
        >
          <option value="todos">Todos</option>
          <option value="ACTIVO">ACTIVOS</option>
          <option value="INACTIVO">INACTIVOS</option>
        </select>

        <select
          value={gestionId}
          onChange={(e) => setGestionId(e.target.value ? Number(e.target.value) : "")}
          className={inputCls}
        >
          <option value="">{/* placeholder */}Gestión</option>
          {gestiones.map((g) => (
            <option key={g.id_gestion} value={g.id_gestion}>{g.anio}-{g.periodo}</option>
          ))}
        </select>

        <select
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : "")}
          className={inputCls}
        >
          <option value="">{/* placeholder */}Materia</option>
          {materias.map((m) => (
            <option key={m.id_materia} value={m.id_materia}>{m.codigo} · {m.nombre}</option>
          ))}
        </select>
      </section>

      <GruposTable items={items} onEdit={openEdit} onToggle={toggle} />

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>
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
