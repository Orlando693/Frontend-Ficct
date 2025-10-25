"use client"

import { useEffect, useMemo, useState } from "react"
import * as roleApi from "../roles/api"
import type { Rol, Modulo, PermSet } from "../roles/types"
import type { Usuario } from "./types"

type Tab = "asignar" | "configurar"

export default function RoleModal({
  open,
  user,
  onClose,
  onAssign,
}: {
  open: boolean
  user: Usuario | null
  onClose: () => void
  onAssign: (userId: number, roleName: string) => Promise<void>
}) {
  const [tab, setTab] = useState<Tab>("asignar")
  const [roles, setRoles] = useState<Rol[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [edit, setEdit] = useState<Rol | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const mods = roleApi.modules()

  async function load() {
    const r = await roleApi.list()
    setRoles(r)
    if (r.length && sel === null) setSel(r[0].id)
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (tab === "configurar") {
      const found = roles.find((x) => x.id === sel) || null
      setEdit(found ? JSON.parse(JSON.stringify(found)) : null)
      setError(null)
    }
  }, [tab, sel, roles, open])

  const roleForAssign = useMemo(() => roles.find((x) => x.id === sel) || null, [roles, sel])

  if (!open) return null

  function togglePerm(m: Modulo, key: keyof PermSet) {
    if (!edit) return
    setEdit({
      ...edit,
      permisos: {
        ...edit.permisos,
        [m]: { ...edit.permisos[m], [key]: !edit.permisos[m][key] },
      },
    })
  }

  async function saveRole() {
    if (!edit) return
    try {
      setSaving(true)
      if (!edit.nombre.trim()) throw new Error("El nombre del rol es obligatorio.")
      if (edit.id) {
        const upd = await roleApi.update(edit.id, edit)
        setRoles((r) => r.map((x) => (x.id === upd.id ? upd : x)))
      } else {
        const created = await roleApi.create({
          nombre: edit.nombre.trim(),
          descripcion: edit.descripcion || "",
          estado: edit.estado || "ACTIVO",
          permisos: edit.permisos || roleApi.defaultPerms(),
        })
        setRoles((r) => [...r, created])
        setSel(created.id)
        setTab("configurar")
      }
      setError(null)
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar el rol.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteRole() {
    if (!edit?.id) return
    if (!confirm("¿Eliminar rol? Esta acción no se puede deshacer.")) return
    try {
      await roleApi.remove(edit.id)
      const r = await roleApi.list()
      setRoles(r)
      setSel(r[0]?.id ?? null)
      setEdit(null)
      setError(null)
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar el rol.")
    }
  }

  async function assignToUser() {
    if (!user || !roleForAssign) return
    await onAssign(user.id, roleForAssign.nombre)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b bg-slate-100">
          <button
            onClick={() => setTab("asignar")}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
              tab === "asignar"
                ? "bg-indigo-600 text-white shadow-lg border-2 border-indigo-700"
                : "bg-slate-700 text-white border-2 border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-md"
            }`}
          >
            Asignar rol a usuario
          </button>
          <button
            onClick={() => setTab("configurar")}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
              tab === "configurar"
                ? "bg-indigo-600 text-white shadow-lg border-2 border-indigo-700"
                : "bg-slate-700 text-white border-2 border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-md"
            }`}
          >
            Roles y permisos
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border-2 border-red-700 shadow-md"
            aria-label="Cerrar"
          >
            Cerrar ✕
          </button>
        </div>

        {/* Body */}
        {tab === "asignar" ? (
          <div className="p-6 space-y-5">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700">
                Usuario: <span className="font-bold text-slate-900">{user?.nombre}</span>
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900 mb-2 block">Seleccionar Rol</span>
              <select
                value={sel ?? ""}
                onChange={(e) => setSel(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                {roles
                  .filter((r) => r.estado === "ACTIVO")
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
              </select>
            </label>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-900 font-bold mb-3">Permisos del rol seleccionado</p>
              <PermsMatrix rol={roleForAssign || undefined} readOnly />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setTab("configurar")}
                className="px-5 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-400 transition-colors"
              >
                Configurar roles
              </button>
              <button
                onClick={assignToUser}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                Asignar Rol
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            <div className="space-y-3">
              <button
                className="w-full px-4 py-3 rounded-lg border-2 border-green-600 bg-green-600 hover:bg-green-700 hover:border-green-700 text-white font-bold shadow-lg transition-all"
                onClick={() =>
                  setEdit({
                    id: 0,
                    nombre: "",
                    descripcion: "",
                    estado: "ACTIVO",
                    permisos: roleApi.defaultPerms(),
                  })
                }
              >
                + Nuevo rol
              </button>

              <div className="space-y-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSel(r.id)
                      setEdit(JSON.parse(JSON.stringify(r)))
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all shadow-md ${
                      sel === r.id
                        ? "bg-indigo-600 border-indigo-700 text-white shadow-lg"
                        : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-bold">{r.nombre}</div>
                    <div className={`text-xs mt-1 ${sel === r.id ? "text-indigo-100" : "text-slate-300"}`}>
                      {r.descripcion}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-5">
              {edit ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label>
                      <span className="text-sm font-bold text-slate-900 mb-2 block">Nombre del rol</span>
                      <input
                        value={edit.nombre}
                        onChange={(e) => setEdit({ ...edit, nombre: e.target.value })}
                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-2.5 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Ej: Administrador"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-bold text-slate-900 mb-2 block">Estado</span>
                      <select
                        value={edit.estado}
                        onChange={(e) => setEdit({ ...edit, estado: e.target.value as any })}
                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-2.5 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </label>
                    <label className="md:col-span-2">
                      <span className="text-sm font-bold text-slate-900 mb-2 block">Descripción</span>
                      <textarea
                        value={edit.descripcion}
                        onChange={(e) => setEdit({ ...edit, descripcion: e.target.value })}
                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-2.5 text-slate-900 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        rows={2}
                        placeholder="Describe las responsabilidades de este rol"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-3">Configurar Permisos</p>
                    <PermsMatrix rol={edit} onToggle={togglePerm} />
                  </div>

                  {error && (
                    <p className="text-sm font-semibold text-red-800 bg-red-100 border-2 border-red-300 rounded-lg p-3">
                      ⚠️ {error}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    {edit.id !== 0 && (
                      <button
                        onClick={deleteRole}
                        className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                      >
                        Eliminar rol
                      </button>
                    )}
                    <button
                      disabled={saving}
                      onClick={saveRole}
                      className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  Selecciona un rol de la lista para editar sus permisos.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PermsMatrix({
  rol,
  onToggle,
  readOnly,
}: {
  rol?: Rol | null
  onToggle?: (m: Modulo, k: keyof PermSet) => void
  readOnly?: boolean
}) {
  const mods = roleApi.modules()
  if (!rol) return <p className="text-sm font-medium text-slate-600">Sin rol seleccionado.</p>

  return (
    <div className="overflow-x-auto rounded-lg border-2 border-slate-300">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-bold">Módulo</th>
            <th className="px-4 py-3 font-bold text-center">Ver</th>
            <th className="px-4 py-3 font-bold text-center">Crear</th>
            <th className="px-4 py-3 font-bold text-center">Editar</th>
            <th className="px-4 py-3 font-bold text-center">Eliminar</th>
          </tr>
        </thead>
        <tbody className="text-slate-900 bg-white">
          {mods.map((m, idx) => (
            <tr key={m} className={`border-t-2 border-slate-200 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
              <td className="px-4 py-3 font-bold text-slate-900">{m}</td>
              {(["ver", "crear", "editar", "eliminar"] as (keyof PermSet)[]).map((k) => (
                <td key={k} className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={!!rol.permisos[m][k]}
                    disabled={readOnly}
                    onChange={() => onToggle && onToggle(m, k)}
                    className="w-5 h-5 rounded border-2 border-slate-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
