"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Usuario, UsuarioForm, RolBase, EstadoUsuario } from "./types"
import api from "./api"
import { Eye, EyeOff, Sparkles, X } from "lucide-react"

export default function UserFormModal({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSaved?: (u: Usuario) => void
  initial?: Usuario | null
}) {
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [username, setUsername] = useState<string | null>(null)
  const [rol, setRol] = useState<RolBase>("Docente")
  const [estado, setEstado] = useState<EstadoUsuario>("PENDIENTE")
  const [password, setPassword] = useState<string>("")
  const [showPwd, setShowPwd] = useState(false)

  const isEdit = !!initial

  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre ?? "")
      setCorreo(initial.correo ?? "")
      setUsername(initial.username ?? null)
      setRol(initial.rol ?? "Docente")
      setEstado(initial.estado ?? "PENDIENTE")
      setPassword("")
    } else {
      setNombre("")
      setCorreo("")
      setUsername(null)
      setRol("Docente")
      setEstado("PENDIENTE")
      setPassword("")
    }
  }, [initial, open])

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&"
    let out = ""
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)]
    setPassword(out)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload: UsuarioForm = {
      nombre,
      correo,
      username: username || undefined,
      rol,
      estado,
      password: password || undefined,
    }

    try {
      const resp = isEdit && initial ? await api.update(initial.id, payload) : await api.create(payload)

      if (typeof onSaved === "function") {
        onSaved(resp)
      }

      const pwd = (password && password.length >= 6 ? password : resp.temp_password) || ""
      if (pwd) {
        try {
          await navigator.clipboard.writeText(pwd)
          alert(`Contraseña temporal: ${pwd}\n(Ya se copió al portapapeles)`)
        } catch {
          alert(`Contraseña temporal: ${pwd}`)
        }
      }

      onClose()
    } catch (err: any) {
      alert(err?.message || "No se pudo guardar el usuario.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
          <h3 className="text-lg sm:text-2xl font-bold text-white">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre completo</label>
              <input
                className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-slate-900 focus:outline-none transition-colors text-sm sm:text-base"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-slate-900 focus:outline-none transition-colors text-sm sm:text-base"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Usuario <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-slate-900 focus:outline-none transition-colors text-sm sm:text-base"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value || null)}
                placeholder="Nombre de usuario"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rol base</label>
              <select
                className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-slate-900 focus:outline-none transition-colors bg-white text-sm sm:text-base"
                value={rol}
                onChange={(e) => setRol(e.target.value as RolBase)}
              >
                <option>Docente</option>
                <option>Jefatura</option>
                <option>CPD</option>
                <option>Decanato</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
              <select
                className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-slate-900 focus:outline-none transition-colors bg-white text-sm sm:text-base"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoUsuario)}
              >
                <option>PENDIENTE</option>
                <option>ACTIVO</option>
                <option>BLOQUEADO</option>
                <option>INACTIVO</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña temporal <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    className="w-full border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-12 focus:border-slate-900 focus:outline-none transition-colors text-sm sm:text-base"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Dejar vacío para autogenerar"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
                    title={showPwd ? "Ocultar" : "Mostrar"}
                  >
                    {showPwd ? (
                      <EyeOff size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <Eye size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg text-sm sm:text-base"
                  title="Generar contraseña"
                >
                  <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Generar
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Si la dejas vacía, el sistema generará una contraseña automáticamente y podrás copiarla al guardar.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-300 bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-black text-white font-semibold hover:bg-slate-900 transition-colors shadow-lg text-sm sm:text-base"
          >
            Guardar usuario
          </button>
        </div>
      </form>
    </div>
  )
}
