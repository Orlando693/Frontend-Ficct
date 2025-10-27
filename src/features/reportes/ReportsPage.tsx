import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Printer, Search, RefreshCcw } from "lucide-react";
import { listDocentes, generarReportes } from "./api";
import type { DocenteItem, Filtros, Row, TipoReporte } from "./types";

// Catálogos locales (selects)
const carreras = ["Sistemas", "Informática", "Industrial"];
const materias = ["BD I", "Algoritmos", "Ingeniería de SW", "Redes"];
const grupos = ["A-1", "A-2", "B-1", "B-2"];
const aulas = ["A-101", "A-102", "B-201", "B-202"];
const gestiones = ["2024-2", "2024-1", "2023-2"];

// CSV helper
function toCSV(rows: Row[]): string {
  if (!rows.length) return "";
  const headByKind: Record<Row["kind"], string[]> = {
    horario: ["Docente","Materia","Grupo","Aula","Día","Inicio","Fin"],
    carga: ["Docente","Carrera","Horas"],
    asistencia: ["Docente","Grupo","Fecha","Presentes","Total"],
    aula: ["Aula","Día","Bloque","Estado"],
  };
  const kind = rows[0].kind;
  const head = headByKind[kind];
  const body = rows.map(r => {
    if (r.kind === "horario") return [r.docente,r.materia,r.grupo,r.aula,r.dia,r.hi,r.hf].join(",");
    if (r.kind === "carga") return [r.docente,r.carrera,r.horas].join(",");
    if (r.kind === "asistencia") return [r.docente,r.grupo,r.fecha,r.presentes,r.total].join(",");
    return [r.aula,r.dia,r.bloque,r.estado].join(",");
  });
  return [head.join(","), ...body].join("\n");
}

export default function ReportsPage() {
  const [f, setF] = useState<Filtros>({ tipo: "horarios", gestion: "2024-2", turno: "" });
  const [data, setData] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Docentes
  const [docentes, setDocentes] = useState<DocenteItem[]>([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingDocentes(true);
      try {
        const list = await listDocentes();   // <- usa token con apiFetch
        if (mounted) setDocentes(list);
      } catch (e: any) {
        console.error(e);
        if (mounted) setDocentes([]);
      } finally {
        if (mounted) setLoadingDocentes(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Métricas simples
  const metrics = useMemo(() => {
    if (!data.length) return { a: 0, b: 0, c: 0, d: 0 };
    if (data[0].kind === "carga") {
      const horas = data.reduce((s, r: any) => s + r.horas, 0);
      return { a: data.length, b: horas, c: 0, d: 0 };
    }
    if (data[0].kind === "asistencia") {
      const sum = data.reduce((s, r: any) => s + (r.presentes / r.total), 0);
      const pct = Math.round((sum / data.length) * 100);
      return { a: data.length, b: pct, c: 0, d: 0 };
    }
    if (data[0].kind === "aula") {
      const ocu = data.filter((r: any) => r.estado === "OCUPADA").length;
      const pct = Math.round((ocu / data.length) * 100);
      return { a: data.length, b: pct, c: ocu, d: data.length - ocu };
    }
    return { a: data.length, b: 0, c: 0, d: 0 };
  }, [data]);

  // Generar
  async function generate() {
    if (!f.gestion) { setError("Selecciona una gestión."); return; }
    setError(null);
    try {
      const rows = await generarReportes(f); // <- usa token con apiFetch
      setData(rows);

      // Bitácora (mock local)
      const logs = JSON.parse(localStorage.getItem("logs") || "[]");
      logs.push({ at: new Date().toISOString(), tipo: f.tipo, filtros: f });
      localStorage.setItem("logs", JSON.stringify(logs));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "No se pudo generar el reporte.");
      setData([]);
    }
  }

  function clearAll() {
    setF({ tipo: "horarios", gestion: "2024-2", turno: "" });
    setData([]);
    setError(null);
  }

  function exportCSV() {
    if (!data.length) return;
    const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${f.tipo}_${f.gestion}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  // Tabla dinámica
  function TableHead() {
    if (f.tipo === "horarios")
      return (<tr><Th>Docente</Th><Th>Materia</Th><Th>Grupo</Th><Th>Aula</Th><Th>Día</Th><Th>Inicio</Th><Th>Fin</Th></tr>);
    if (f.tipo === "carga")
      return (<tr><Th>Docente</Th><Th>Carrera</Th><Th>Horas</Th></tr>);
    if (f.tipo === "asistencia")
      return (<tr><Th>Docente</Th><Th>Grupo</Th><Th>Fecha</Th><Th>Presentes</Th><Th>Total</Th><Th>%</Th></tr>);
    return (<tr><Th>Aula</Th><Th>Día</Th><Th>Bloque</Th><Th>Estado</Th></tr>);
  }

  function TableBody() {
    return data.map((r, i) => {
      if (r.kind === "horario")
        return (<tr key={i} className="border-b last:border-0">
          <Td>{r.docente}</Td><Td>{r.materia}</Td><Td>{r.grupo}</Td>
          <Td>{r.aula}</Td><Td>{r.dia}</Td><Td>{r.hi}</Td><Td>{r.hf}</Td>
        </tr>);
      if (r.kind === "carga")
        return (<tr key={i} className="border-b last:border-0">
          <Td>{r.docente}</Td><Td>{r.carrera}</Td><Td>{r.horas}</Td>
        </tr>);
      if (r.kind === "asistencia") {
        const pct = Math.round((r.presentes / r.total) * 100);
        return (<tr key={i} className="border-b last:border-0">
          <Td>{r.docente}</Td><Td>{r.grupo}</Td><Td>{r.fecha}</Td>
          <Td>{r.presentes}</Td><Td>{r.total}</Td><Td><Badge pct={pct} /></Td>
        </tr>);
      }
      return (<tr key={i} className="border-b last:border-0">
        <Td>{r.aula}</Td><Td>{r.dia}</Td><Td>{r.bloque}</Td>
        <Td><span className={`px-2 py-0.5 text-xs rounded-full ${r.estado === "OCUPADA" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>{r.estado}</span></Td>
      </tr>);
    });
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div>
              <p className="text-xs tracking-widest text-slate-300">REPORTES</p>
              <h2 className="text-2xl font-semibold">Generar reportes</h2>
              <p className="text-slate-300 text-sm mt-1">
                Filtra por gestión, carrera, docente, grupos, aulas y periodo. Exporta a CSV/Excel o PDF.
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Download className="w-4 h-4" /> CSV/Excel
            </button>
            <button onClick={exportPDF} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              <Printer className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 border border-slate-200 print:hidden">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[180px]">
            <Label>Tipo de reporte</Label>
            <select className="w-full border rounded-lg px-3 py-2"
              value={f.tipo}
              onChange={(e) => setF({ ...f, tipo: e.target.value as TipoReporte })}
            >
              <option value="horarios">Horarios (docente/grupo/aula)</option>
              <option value="carga">Carga horaria (docente/carrera)</option>
              <option value="asistencia">Asistencia (docente/grupo/periodo)</option>
              <option value="aulas">Uso/Disponibilidad de aulas</option>
            </select>
          </div>

          <div className="min-w-[140px]">
            <Label>Gestión</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.gestion} onChange={(e)=>setF({ ...f, gestion: e.target.value })}>
              {gestiones.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="min-w-[180px]">
            <Label>Desde</Label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={f.desde || ""} onChange={(e)=>setF({ ...f, desde: e.target.value })}/>
          </div>
          <div className="min-w-[180px]">
            <Label>Hasta</Label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={f.hasta || ""} onChange={(e)=>setF({ ...f, hasta: e.target.value })}/>
          </div>

          <div className="min-w-[180px]">
            <Label>Carrera</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.carrera || ""} onChange={(e)=>setF({ ...f, carrera: e.target.value })}>
              <option value="">Todas</option>
              {carreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="min-w-[160px]">
            <Label>Materia</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.materia || ""} onChange={(e)=>setF({ ...f, materia: e.target.value })}>
              <option value="">Todas</option>
              {materias.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="min-w-[200px]">
            <Label>Docente</Label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={f.docente || ""}
              onChange={(e)=>setF({ ...f, docente: e.target.value })}
            >
              <option value="">Todos</option>
              {loadingDocentes && <option disabled>Cargando...</option>}
              {!loadingDocentes && docentes.length === 0 && <option disabled>No hay docentes</option>}
              {docentes.map(d => (
                <option key={d.id} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <Label>Grupo</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.grupo || ""} onChange={(e)=>setF({ ...f, grupo: e.target.value })}>
              <option value="">Todos</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="min-w-[120px]">
            <Label>Aula</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.aula || ""} onChange={(e)=>setF({ ...f, aula: e.target.value })}>
              <option value="">Todas</option>
              {aulas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="min-w-[140px]">
            <Label>Turno</Label>
            <select className="w-full border rounded-lg px-3 py-2" value={f.turno || ""} onChange={(e)=>setF({ ...f, turno: e.target.value as any })}>
              <option value="">Todos</option>
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              <Search className="w-4 h-4" /> Generar
            </button>
            <button onClick={clearAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border">
              <RefreshCcw className="w-4 h-4" /> Limpiar
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        <Card title="Registros">{metrics.a}</Card>
        {f.tipo === "carga" && <Card title="Horas totales">{metrics.b}</Card>}
        {f.tipo === "asistencia" && <Card title="Asistencia promedio">{metrics.b}%</Card>}
        {f.tipo === "aulas" && (
          <>
            <Card title="Ocupación">{metrics.b}%</Card>
            <Card title="Bloques ocupados">{metrics.c}</Card>
            <Card title="Bloques libres">{metrics.d}</Card>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <TableHead />
            </thead>
            <tbody className="text-slate-900">
              <TableBody />
              {!data.length && (
                <tr>
                  <td className="p-6 text-center text-slate-600" colSpan={8}>
                    Sin resultados. Ajusta filtros y pulsa <strong>Generar</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// UI helpers
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-slate-700 mb-1">{children}</label>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-slate-200">
      <p className="text-xs text-slate-600">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{children}</p>
    </div>
  );
}
function Badge({ pct }: { pct: number }) {
  const tone =
    pct >= 85 ? "bg-emerald-100 text-emerald-800"
      : pct >= 70 ? "bg-yellow-100 text-yellow-800"
      : "bg-rose-100 text-rose-800";
  return <span className={`px-2 py-0.5 text-xs rounded-full ${tone}`}>{pct}%</span>;
}
