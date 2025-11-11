"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import HorarioModal from "./HorarioModal";
import type { GrupoMiniDTO, HorarioDTO } from "./types";
import {
  listGestiones, listGrupos, listHorarios, createHorario, deleteHorario
} from "./api";
import type { Gestion, GestionDTO } from "../parametros/types";
import { dtoToGestion } from "../parametros/types";
import ProgramacionTabs from "./Tabs";

const label = "block text-sm text-slate-800";
const input =
  "rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 " +
  "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400";

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-200">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          {/* gris visible (no negro) */}
          <div className="h-4 w-full max-w-[160px] rounded bg-slate-500 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function ProgramacionAcademica() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [gestionId, setGestionId] = useState<number | "">("");
  const [grupos, setGrupos] = useState<GrupoMiniDTO[]>([]);
  const [grupoId, setGrupoId] = useState<number | "">("");

  const [items, setItems] = useState<HorarioDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string|null>(null);

  type ModalFormValues = {
    dia_semana: number | "";
    hora_inicio: string;
    hora_fin: string;
    aula_id: number | "";
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await listGestiones();
        const dtos = data as unknown as GestionDTO[];
        setGestiones(dtos.map(dtoToGestion));
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar gestiones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setGrupos([]); setGrupoId("");
      setItems([]);
      if (typeof gestionId !== "number") return;
      try {
        setLoading(true); setError(null);
        const { data } = await listGrupos({ gestion_id: gestionId });
        setGrupos(data);
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar grupos");
      } finally {
        setLoading(false);
      }
    })();
  }, [gestionId]);

  useEffect(() => {
    (async () => {
      setItems([]);
      if (typeof gestionId !== "number") return;
      try {
        setLoading(true); setError(null);
        const { data } = await listHorarios({
          gestion_id: gestionId,
          grupo_id: typeof grupoId === "number" ? grupoId : undefined,
        });
        setItems(data);
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar horarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [gestionId, grupoId]);

  async function handleCreate(values: Required<ModalFormValues>) {
    if (typeof grupoId !== "number") return;
    try {
      setBusy(true); setError(null);
      const payload = {
        grupo_id: Number(grupoId),
        aula_id: Number(values.aula_id),
        dia_semana: Number(values.dia_semana),
        hora_inicio: values.hora_inicio,
        hora_fin: values.hora_fin,
      };
      await createHorario(payload);
      const { data } = await listHorarios({
        gestion_id: Number(gestionId),
        grupo_id: Number(grupoId)
      });
      setItems(data);
      setOpen(false);
    } catch (e:any) {
      setError(e.message || "No se pudo guardar el bloque");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id:number) {
    if (!confirm("¿Eliminar este bloque de horario?")) return;
    try {
      setBusy(true); setError(null);
      await deleteHorario(id);
      setItems(prev => prev.filter(x => x.id_horario !== id));
    } catch (e:any) {
      setError(e.message || "No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <ProgramacionTabs />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Programación Académica</h1>
        <p className="text-slate-700 text-sm">
          Crea y edita bloques (día/hora) asignando aula disponible sin choques (aula/docente/grupo).
          {loading ? " · Cargando…" : ""}
        </p>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-2xl shadow p-4 ring-1 ring-slate-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={label}>Gestión</label>
            <select
              value={gestionId}
              onChange={(e)=>setGestionId(e.target.value===""? "": Number(e.target.value))}
              className={input}
            >
              <option value="">— Selecciona —</option>
              {gestiones.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className={label}>Grupo</label>
            <select
              value={grupoId}
              onChange={(e)=>setGrupoId(e.target.value===""? "": Number(e.target.value))}
              className={input}
            >
              <option value="">— Selecciona —</option>
              {grupos.map(gr => (
                <option key={gr.id_grupo} value={gr.id_grupo}>
                  {gr.materia_label} · {gr.paralelo} · {gr.turno} · cap {gr.capacidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={()=>setOpen(true)}
            disabled={typeof gestionId !== "number" || typeof grupoId !== "number"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" /> Nuevo bloque
          </button>
        </div>
      </section>

      {/* Tabla de programación (alto contraste + responsive) */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto ring-1 ring-slate-200">
        <table className="min-w-full text-sm text-slate-900">
          <thead className="bg-slate-900 text-white sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Día</th>
              <th className="text-left px-4 py-2 font-semibold">Inicio</th>
              <th className="text-left px-4 py-2 font-semibold">Fin</th>
              <th className="text-left px-4 py-2 font-semibold">Aula</th>
              <th className="text-left px-4 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading && (<>
              <SkeletonRow/><SkeletonRow/><SkeletonRow/>
            </>)}

            {!loading && items.length === 0 && (
              <tr className="bg-white">
                <td colSpan={5} className="px-4 py-6 text-center text-slate-800">Sin bloques programados</td>
              </tr>
            )}

            {!loading && items.map((h, idx) => (
              <tr
                key={h.id_horario}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors`}
              >
                <td className="px-4 py-2">
                  {["","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"][h.dia_semana]}
                </td>
                <td className="px-4 py-2">{h.hora_inicio}</td>
                <td className="px-4 py-2">{h.hora_fin}</td>
                <td className="px-4 py-2">{h.aula_label ?? h.aula_id}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={()=>handleDelete(h.id_horario)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-600/40 shadow-sm"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-white" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {busy && (
          <div className="p-3 text-sm text-slate-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Procesando…
          </div>
        )}
      </section>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}

      {/* Modal */}
      {typeof gestionId === "number" && typeof grupoId === "number" && (
        <HorarioModal
          open={open}
          gestionId={Number(gestionId)}
          grupoId={Number(grupoId)}
          onCancel={()=>setOpen(false)}
          onSubmit={handleCreate}
          busy={busy}
        />
      )}
    </div>
  );
}
