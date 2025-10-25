import { useEffect, useMemo, useState } from "react"
import {
  Plus, Search, ShieldBan, ShieldCheck, Pencil, Trash2, RotateCcw,
} from "lucide-react"
import type { Usuario, RolBase, EstadoUsuario } from "./types"
import * as api from "./api"
import UserFormModal from "./UserFormModal"

const roles: RolBase[] = ["Decanato", "CPD", "Jefatura", "Docente"]
const estados: EstadoUsuario[] = ["ACTIVO", "PENDIENTE", "BLOQUEADO", "INACTIVO"]

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode
  tone?: "blue" | "yellow" | "green" | "red" | "slate"
}) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-800 ring-slate-200",
    blue: "bg-blue-50 text-blue-800 ring-blue-200",
    yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
    green: "bg-green-50 text-green-800 ring-green-200",
    red: "bg-red-50 text-red-800 ring-red-200",
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ring-1 ${map[tone]}`}>
      {children}
    </span>
  )
}

export default function UsersClient() {
  const [data, setData] = useState<Usuario[]>([])
  const [q, setQ] = useState("")
  const [fRol, setFRol] = useState<"" | RolBase>("")
  const [fEstado, setFEstado] = useState<"" | EstadoUsuario>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState<Usuario | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.list().then(setData)
  }, [])

  const view = useMemo(() => {
    return data
      .filter((u) => !fRol || u.rol === fRol)
      .filter((u) => !fEstado || u.estado === fEstado)
      .filter((u) => {
        const t = (
          u.nombre +
          " " +
          (u.username || "") +
          " " +
          u.correo
        ).toLowerCase()
        return t.includes(q.toLowerCase())
      })
  }, [data, q, fRol, fEstado])

  function toneEstado(s: EstadoUsuario) {
    switch (s) {
      case "ACTIVO":
        return "green"
      case "BLOQUEADO":
        return "red"
      case "PENDIENTE":
        return "yellow"
      default:
        return "slate"
    }
  }

  async function crear(payload: Omit<Usuario, "id">) {
    const u = await api.create(payload)
    setData((d) => [u, ...d])
    setMsg("Usuario creado.")
  }

  async function editar(payload: Partial<Usuario>) {
    const u = await api.update(payload.id!, payload)
    setData((d) => d.map((x) => (x.id === u.id ? u : x)))
    setMsg("Usuario actualizado.")
  }

  async function bloquear(u: Usuario) {
    const up = await api.setEstado(u.id, "BLOQUEADO")
    setData((d) => d.map((x) => (x.id === u.id ? ((up as unknown) as Usuario) : x)))
    setMsg("Usuario bloqueado.")
  }

  async function activar(u: Usuario) {
    const up = await api.setEstado(u.id, "ACTIVO")
    setData((d) => d.map((x) => (x.id === u.id ? ((up as unknown) as Usuario) : x)))
    setMsg("Usuario activado.")
  }

  async function eliminar(u: Usuario) {
    try {
      await api.remove(u.id)
      setData((d) => d.filter((x) => x.id !== u.id))
      setMsg("Usuario eliminado.")
    } catch (e: any) {
      // Regla: si tiene dependencias críticas (docente con horarios), se bloquea
      const upd = await api.list()
      setData(upd)
      setMsg(e?.message || "No se pudo eliminar.")
    }
  }

  async function reset(u: Usuario) {
    await api.resetPassword(u.id)
    setMsg("Se marcó para restablecer contraseña.")
  }

  return (
    // Contenedor acotado para evitar empujar el viewport; textos en oscuro
    <div className="space-y-6 max-w-6xl text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest text-slate-300">
              GESTIÓN DE USUARIOS
            </p>
            <h2 className="text-2xl font-semibold">
              Administración de cuentas
            </h2>
            <p className="text-slate-200/90 text-sm mt-1">
              Crear, editar, bloquear y eliminar cuentas; asignar rol base.
            </p>
          </div>
          <button
            onClick={() => {
              setEditRow(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Nuevo usuario
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar por nombre, usuario o correo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>

        <select
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800"
          value={fRol}
          onChange={(e) => setFRol(e.target.value as RolBase | "")}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800"
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value as EstadoUsuario | "")}
        >
          <option value="">Todos los estados</option>
          {estados.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setQ("")
            setFRol("")
            setFEstado("")
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>

      {/* Mensaje */}
      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3">
          <div className="flex justify-between items-start gap-4">
            <p className="text-sm">{msg}</p>
            <button
              onClick={() => setMsg(null)}
              className="text-sm text-blue-800 hover:underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="text-left bg-slate-100 text-slate-700 text-sm border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold">Nombre</th>
              <th className="p-3 font-semibold">Usuario</th>
              <th className="p-3 font-semibold">Correo</th>
              <th className="p-3 font-semibold">Rol</th>
              <th className="p-3 font-semibold">Estado</th>
              <th className="p-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-800">
            {view.map((u) => (
              <tr key={u.id} className="border-b last:border-0 border-slate-200">
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.username || "-"}</td>
                <td className="p-3">{u.correo}</td>
                <td className="p-3">{u.rol}</td>
                <td className="p-3">
                  <Badge tone={toneEstado(u.estado) as any}>{u.estado}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditRow(u)
                        setModalOpen(true)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" /> Editar
                    </button>

                    {u.estado === "BLOQUEADO" ? (
                      <button
                        onClick={() => activar(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                        title="Desbloquear"
                      >
                        <ShieldCheck className="w-4 h-4" /> Desbloquear
                      </button>
                    ) : (
                      <button
                        onClick={() => bloquear(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 inline-flex items-center gap-1"
                        title="Bloquear"
                      >
                        <ShieldBan className="w-4 h-4" /> Bloquear
                      </button>
                    )}

                    <button
                      onClick={() => reset(u)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1"
                      title="Restablecer contraseña"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar usuario?")) eliminar(u)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {view.length === 0 && (
              <tr>
                <td className="p-6 text-center text-slate-600" colSpan={6}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editRow}
        onSubmit={async (payload) => {
          if ((payload as any).id) {
            await editar(payload as any)
          } else {
            await crear(payload as any)
          }
        }}
      />
    </div>
  )
}
