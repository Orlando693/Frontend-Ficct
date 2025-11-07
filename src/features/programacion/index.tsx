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


const label = "block text-sm text-slate-600";
const input =
  "rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

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

  // 👇 tipo local compatible con el FormState de HorarioModal (mismas keys y unions)
  type ModalFormValues = {
    dia_semana: number | "";
    hora_inicio: string;
    hora_fin: string;
    aula_id: number | "";
  };

  // Cargar gestiones
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

  // Cargar grupos al cambiar gestión
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

  // Cargar horarios al elegir grupo
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

  // ✅ firma compatible con HorarioModal: (values: Required<FormState>) => void|Promise<void>
  async function handleCreate(values: Required<ModalFormValues>) {
    if (typeof grupoId !== "number") return;
    try {
      setBusy(true); setError(null);

      // normalizar a números seguros
      const payload = {
        grupo_id: Number(grupoId),
        aula_id: Number(values.aula_id),
        dia_semana: Number(values.dia_semana),
        hora_inicio: values.hora_inicio,
        hora_fin: values.hora_fin,
      };

      await createHorario(payload);

      // refrescar tabla
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
        <h1 className="text-2xl font-semibold">Programación Académica</h1>
        <p className="text-slate-600 text-sm">
          Crea y edita bloques (día/hora) asignando aula disponible sin choques (aula/docente/grupo).
          {loading ? " · Cargando…" : ""}
        </p>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-2xl shadow p-4">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Nuevo bloque
          </button>
        </div>
      </section>

      {/* Tabla de programación */}
      <section className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="text-left px-4 py-2">Día</th>
              <th className="text-left px-4 py-2">Inicio</th>
              <th className="text-left px-4 py-2">Fin</th>
              <th className="text-left px-4 py-2">Aula</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Sin bloques programados</td></tr>
            )}
            {items.map(h => (
              <tr key={h.id_horario} className="border-t">
                <td className="px-4 py-2">
                  {["","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"][h.dia_semana]}
                </td>
                <td className="px-4 py-2">{h.hora_inicio}</td>
                <td className="px-4 py-2">{h.hora_fin}</td>
                <td className="px-4 py-2">{h.aula_label ?? h.aula_id}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={()=>handleDelete(h.id_horario)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {busy && (
          <div className="p-3 text-sm text-slate-600 flex items-center gap-2">
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
