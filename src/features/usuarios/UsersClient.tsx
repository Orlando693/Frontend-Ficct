"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Plus, Search, ShieldBan, ShieldCheck, Pencil, Trash2, BadgeCheck } from "lucide-react"
import type { Usuario, RolBase, EstadoUsuario } from "./types"
import api from "./api"
import UserFormModal from "./UserFormModal"
import RoleModal from "./RoleModal"
import * as roleApi from "../roles/api"

const ESTADOS: EstadoUsuario[] = ["ACTIVO", "PENDIENTE", "BLOQUEADO", "INACTIVO"]

function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode
  tone?: "blue" | "yellow" | "green" | "red" | "slate"
}) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-800 ring-slate-200",
    blue: "bg-blue-50 text-blue-800 ring-blue-200",
    yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
    green: "bg-green-50 text-green-800 ring-green-200",
    red: "bg-red-50 text-red-800 ring-red-200",
  }
  return <span className={`px-2 py-0.5 text-xs rounded ring-1 ${map[tone]}`}>{children}</span>
}

export default function UsersClient() {
  const [data, setData] = useState<Usuario[]>([])
  // 👉 los nombres de rol se tipan como RolBase[]
  const [roles, setRoles] = useState<RolBase[]>([])
  const [q, setQ] = useState("")
  const [fRol, setFRol] = useState<"" | RolBase>("")
  const [fEstado, setFEstado] = useState<"" | EstadoUsuario>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState<Usuario | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleRow, setRoleRow] = useState<Usuario | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.list().then(setData).catch(console.error)
  }, [])

  useEffect(() => {
    roleApi
      .list()
      // solo activos y nos quedamos con el nombre como RolBase
      .then((rs) => setRoles(rs.filter((r: any) => r.estado === "ACTIVO").map((r: any) => r.nombre as RolBase)))
      .catch(console.error)
  }, [])

  const view = useMemo(() => {
    return data
      .filter((u) => !fRol || u.rol === fRol)
      .filter((u) => !fEstado || u.estado === fEstado)
      .filter((u) => (u.nombre + " " + (u.username || "") + " " + u.correo).toLowerCase().includes(q.toLowerCase()))
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
    setData((d) => d.map((x) => (x.id === u.id ? up : x)))
    setMsg("Usuario bloqueado.")
  }
  async function activar(u: Usuario) {
    const up = await api.setEstado(u.id, "ACTIVO")
    setData((d) => d.map((x) => (x.id === u.id ? up : x)))
    setMsg("Usuario activado.")
  }
  async function eliminar(u: Usuario) {
    try {
      await api.remove(u.id)
      setData((d) => d.filter((x) => x.id !== u.id))
      setMsg("Usuario eliminado.")
    } catch (e: any) {
      const upd = await api.list()
      setData(upd)
      setMsg(e?.message || "No se pudo eliminar.")
    }
  }

  // 👉 compatible con RoleModal: acepta RolBase | string
  async function assignRole(userId: number, roleName: RolBase | string) {
    const target = data.find((u) => u.id === userId)
    if (!target) return
    const upd = await api.update(userId, { rol: roleName as RolBase })
    setData((d) => d.map((x) => (x.id === userId ? upd : x)))
    setMsg("Rol asignado.")
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-slate-800">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-slate-300">GESTIÓN DE USUARIOS</p>
            <h2 className="text-xl sm:text-2xl font-semibold">Administración de cuentas</h2>
            <p className="text-slate-200/90 text-xs sm:text-sm mt-1">
              Crear, editar, bloquear y eliminar cuentas; asignar rol base. También puedes configurar roles y permisos.
            </p>
          </div>
          <button
            onClick={() => {
              setEditRow(null)
              setModalOpen(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Nuevo usuario
          </button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <label className="relative flex-1 min-w-full sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por nombre, usuario o correo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            />
          </label>

          <select
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-sm sm:text-base"
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
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-sm sm:text-base"
            value={fEstado}
            onChange={(e) => setFEstado(e.target.value as EstadoUsuario | "")}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4">
          <div className="flex justify-between items-start gap-4">
            <p className="text-xs sm:text-sm">{msg}</p>
            <button onClick={() => setMsg(null)} className="text-xs sm:text-sm text-blue-800 hover:underline whitespace-nowrap">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="text-left bg-slate-800 text-white text-xs sm:text-sm">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Nombre</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Usuario</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Correo</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Rol</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Estado</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-slate-900">
              {view.map((u) => (
                <tr key={u.id} className="border-b last:border-0 border-slate-200 hover:bg-slate-50">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{u.nombre}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{u.username || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{u.correo}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{u.rol}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <Badge tone={toneEstado(u.estado) as any}>{u.estado}</Badge>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setEditRow(u)
                          setModalOpen(true)
                        }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs whitespace-nowrap"
                      >
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoleRow(u)
                          setRoleModalOpen(true)
                        }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs whitespace-nowrap"
                      >
                        <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Rol</span>
                      </button>

                      {u.estado === "BLOQUEADO" ? (
                        <button
                          onClick={() => activar(u)}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs whitespace-nowrap"
                        >
                          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Activar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => bloquear(u)}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs whitespace-nowrap"
                        >
                          <ShieldBan className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Bloquear</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar usuario?")) eliminar(u)
                        }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {view.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-600 text-xs sm:text-sm" colSpan={6}>
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar usuario */}
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editRow}
        onSaved={async (u) => {
          if (editRow) {
            await editar(u)
          } else {
            await crear(u)
          }
        }}
      />

      {/* Modal Roles y permisos */}
      <RoleModal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} user={roleRow} onAssign={assignRole} />
    </div>
  )
}
