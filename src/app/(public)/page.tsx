"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Calendar, Shield, Clock, Mail, Lock, Eye, EyeOff } from "lucide-react"

// Asegúrate que en Vercel tengas VITE_API_URL=https://backend-ficct-production.up.railway.app/api
const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8080/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Si ya hay sesión, entra directo
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    if (token) {
      window.location.replace("/admin")
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        let msg = "No se pudo iniciar sesión."
        if (res.status === 422) msg = "Revisa correo y contraseña."
        if (res.status === 403) msg = "Cuenta bloqueada o inactiva."
        setPassword("") // limpiar por seguridad
        throw new Error(msg)
      }

      const data = await res.json() // { token, user, abilities }

      // Elegimos dónde guardar según "Recordarme"
      const main = remember ? localStorage : sessionStorage
      const other = remember ? sessionStorage : localStorage

      // Guardar sesión completa
      main.setItem("auth_token", data.token)
      if (data.user) {
        try {
          main.setItem("auth_user", JSON.stringify(data.user))
        } catch {}
        const role = data.user?.rol ?? data.user?.role
        if (role) main.setItem("role", role)
      }
      if (data.abilities) {
        try {
          main.setItem("abilities", JSON.stringify(data.abilities))
        } catch {}
      }

      // Limpiar el otro storage para no mezclar sesiones
      ;["auth_token", "auth_user", "role", "abilities"].forEach((k) =>
        other.removeItem(k),
      )

      // Redirección por rol (por ahora todos a /admin)
      const path: Record<string, string> = {
        Decanato: "/admin",
        CPD: "/admin",
        Jefatura: "/admin",
        Docente: "/admin",
      }
      window.location.assign(path[data.user?.rol] || "/admin")
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh w-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[48%_52%] bg-white">
      {/* IZQUIERDA: bienvenida */}
      <section className="hidden lg:block bg-slate-900 text-white">
        <div className="h-full flex items-center p-8 xl:p-14">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> FICCT Sistema Académico
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Planificación Académica Inteligente
            </h1>
            <p className="mt-3 text-slate-300">
              Gestiona horarios, aulas y asistencia. Acceso para Decanato, CPD, Jefatura y Docentes.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-300" />
                </span>
                <div>
                  <p className="font-medium">Evita conflictos de horarios</p>
                  <p className="text-sm text-slate-400">
                    Disponibilidad de aulas y docentes en tiempo real
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10">
                  <Shield className="w-5 h-5 text-blue-300" />
                </span>
                <div>
                  <p className="font-medium">Control por roles</p>
                  <p className="text-sm text-slate-400">Permisos según tu función</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-300" />
                </span>
                <div>
                  <p className="font-medium">Registro de actividad</p>
                  <p className="text-sm text-slate-400">Bitácora de eventos y cambios</p>
                </div>
              </li>
            </ul>

            <p className="mt-10 text-xs text-slate-500">
              Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones
            </p>
          </div>
        </div>
      </section>

      {/* DERECHA: login */}
      <section className="bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md px-4 sm:px-6 md:px-10 lg:px-12 lg:-ml-6">
          <div className="mb-6 lg:hidden text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> FICCT Sistema Académico
            </span>
          </div>

          <header className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Iniciar sesión
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ficct.edu.bo"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg
                             text-slate-900 placeholder:text-slate-400 text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-300 rounded-lg
                             text-slate-900 placeholder:text-slate-400 text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Recordarme</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900 text-white font-medium rounded-lg text-sm sm:text-base
                         hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <p className="text-xs text-slate-500 text-center pt-2">
              Al iniciar sesión, aceptas que tus acciones sean registradas en la bitácora del sistema.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
