"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  listCarrerasActivas, listMateriasActivas,
  listPlanByCarrera, createPlan, deletePlan
} from "./api.plan";
import type { CarreraMiniDTO, MateriaMiniDTO, PlanRecord, PlanDTO } from "./types";
import { dtoToPlan } from "./types";

const label = "block text-sm text-slate-600";
const input =
  "w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";

export default function PlanEstudios() {
  const [carreras, setCarreras] = useState<CarreraMiniDTO[]>([]);
  const [materias, setMaterias] = useState<MateriaMiniDTO[]>([]);
  const [carreraId, setCarreraId] = useState<number | "">("");
  const [items, setItems] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // form alta
  const [materiaId, setMateriaId] = useState<number | "">("");
  const [plan, setPlan] = useState<number | "">("");
  const [semestre, setSemestre] = useState<number | "">("");
  const [tipo, setTipo] = useState("obligatoria");
  const [teo, setTeo] = useState<number | "">("");
  const [pra, setPra] = useState<number | "">("");

  const materiasMap = useMemo(() => {
    const m = new Map<number, MateriaMiniDTO>();
    materias.forEach(x => m.set(x.id_materia, x));
    return m;
  }, [materias]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const [{ data: c }, { data: m }] = await Promise.all([
          listCarrerasActivas(),
          listMateriasActivas(),
        ]);
        setCarreras(c); setMaterias(m);
      } catch (e:any) {
        setError(e.message || "No se pudieron cargar catálogos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (typeof carreraId !== "number") { setItems([]); return; }
      try {
        setLoading(true); setError(null);
        const { data } = await listPlanByCarrera(carreraId);
        const enriched: PlanRecord[] = data.map((p: PlanDTO) => dtoToPlan(p, materiasMap.get(p.materia_id)));
        setItems(enriched);
      } catch (e:any) {
        setError(e.message || "No se pudo listar el plan");
      } finally {
        setLoading(false);
      }
    })();
  }, [carreraId, materiasMap]);

  async function agregar() {
    try {
      setBusy(true); setError(null);
      if (
        typeof carreraId !== "number" ||
        typeof materiaId !== "number" ||
        plan === "" || semestre === "" || teo === "" || pra === ""
      ) throw new Error("Completa todos los campos.");
      const res = await createPlan({
        carrera_id: carreraId,
        materia_id: materiaId,
        plan: Number(plan),
        semestre: Number(semestre),
        tipo,
        carga_teo: Number(teo),
        carga_pra: Number(pra),
      });
      // refrescar
      const { data } = await listPlanByCarrera(carreraId);
      setItems(data.map(p => dtoToPlan(p, materiasMap.get(p.materia_id))));
      // limpiar form rápido
      setMateriaId(""); setPlan(""); setSemestre(""); setTipo("obligatoria"); setTeo(""); setPra("");
    } catch (e:any) {
      setError(e.message || "No se pudo asociar la materia");
    } finally {
      setBusy(false);
    }
  }

  async function eliminar(id:number) {
    if (!confirm("¿Eliminar asociación del plan?")) return;
    try {
      setBusy(true); setError(null);
      await deletePlan(id);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e:any) {
      setError(e.message || "No se pudo eliminar (revisa si tiene grupos vigentes)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Plan de estudios (asignar materias a carreras)</h2>
        <p className="text-slate-600 text-sm">
          Define plan/semestre/tipo y cargas. {loading ? " · Cargando…" : ""}
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className={label}>Carrera</label>
          <select
            value={carreraId}
            onChange={(e)=>setCarreraId(e.target.value===""? "": Number(e.target.value))}
            className={input}
          >
            <option value="">— Selecciona —</option>
            {carreras.map(c=>(
              <option key={c.id_carrera} value={c.id_carrera}>
                {c.sigla} · {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      {typeof carreraId === "number" && (
        <>
          {/* Alta rápida */}
          <section className="bg-white rounded-2xl shadow p-4 space-y-4">
            <h3 className="font-semibold text-slate-800">Asociar materia</h3>
            <div className="grid md:grid-cols-5 gap-3">
              <div className="space-y-2">
                <label className={label}>Materia</label>
                <select
                  value={materiaId}
                  onChange={(e)=>setMateriaId(e.target.value===""? "": Number(e.target.value))}
                  className={input}
                >
                  <option value="">— Selecciona —</option>
                  {materias.map(m=>(
                    <option key={m.id_materia} value={m.id_materia}>
                      {m.codigo} · {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={label}>Plan</label>
                <input type="number" min={1} max={50} value={plan}
                  onChange={(e)=>setPlan(e.target.value===""?"":Number(e.target.value))}
                  placeholder="2025" className={input}/>
              </div>
              <div className="space-y-2">
                <label className={label}>Semestre</label>
                <input type="number" min={1} max={12} value={semestre}
                  onChange={(e)=>setSemestre(e.target.value===""?"":Number(e.target.value))}
                  placeholder="1" className={input}/>
              </div>
              <div className="space-y-2">
                <label className={label}>Tipo</label>
                <select value={tipo} onChange={(e)=>setTipo(e.target.value)} className={input}>
                  <option value="obligatoria">Obligatoria</option>
                  <option value="electiva">Electiva</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={label}>Teoría</label>
                  <input type="number" min={0} value={teo}
                    onChange={(e)=>setTeo(e.target.value===""?"":Number(e.target.value))}
                    placeholder="2" className={input}/>
                </div>
                <div className="space-y-2">
                  <label className={label}>Práctica</label>
                  <input type="number" min={0} value={pra}
                    onChange={(e)=>setPra(e.target.value===""?"":Number(e.target.value))}
                    placeholder="2" className={input}/>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={agregar}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Asociar
              </button>
            </div>
          </section>

          {/* Listado */}
          <section className="bg-white rounded-2xl shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="text-left px-4 py-2">Materia</th>
                    <th className="text-left px-4 py-2">Plan</th>
                    <th className="text-left px-4 py-2">Semestre</th>
                    <th className="text-left px-4 py-2">Tipo</th>
                    <th className="text-left px-4 py-2">Teo</th>
                    <th className="text-left px-4 py-2">Pra</th>
                    <th className="text-left px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500">Sin asociaciones</td>
                    </tr>
                  )}
                  {items.map(p=>(
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">{p.materia_label}</td>
                      <td className="px-4 py-2">{p.plan}</td>
                      <td className="px-4 py-2">{p.semestre}</td>
                      <td className="px-4 py-2 capitalize">{p.tipo}</td>
                      <td className="px-4 py-2">{p.carga_teo}</td>
                      <td className="px-4 py-2">{p.carga_pra}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={()=>eliminar(p.id)}
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
            </div>
          </section>

          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>}
        </>
      )}
    </div>
  );
}
