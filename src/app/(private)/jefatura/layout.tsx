"use client"

import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, LogOut, BarChart3, ScrollText, Menu, X, BookOpenText, Layers, CalendarRange } from "lucide-react"
import { useState } from "react"
import { logout } from "../../../features/auth/logout"

const linkBase = "flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200/90 hover:text-white hover:bg-white/10"
const linkActive = "bg-white/15 text-white shadow-inner"

export default function JefaturaLayout() {
  const role = localStorage.getItem("role") || "Jefatura"
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-dvh w-screen overflow-x-hidden bg-slate-50">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-slate-900 text-white shadow-lg hover:bg-slate-800"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-4 min-h-dvh transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="mb-4 space-y-2">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[11px] tracking-[0.22em] text-slate-300">FICCT</p>
              <h1 className="font-semibold">Panel {role}</h1>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-slate-300">Sesión activa</p>
              <p className="text-sm">Usuario {role}</p>
            </div>
          </div>

          <nav className="mt-4 space-y-2 font-medium">
            <NavLink to="/jefatura" className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`} onClick={() => setIsSidebarOpen(false)}>
              <LayoutDashboard className="w-5 h-5" />
              Resumen
            </NavLink>
            <NavLink to="/jefatura/reportes" className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`} onClick={() => setIsSidebarOpen(false)}>
              <BarChart3 className="w-5 h-5" />
              Gestión de Reportes
            </NavLink>
            <NavLink to="/jefatura/bitacora" className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`} onClick={() => setIsSidebarOpen(false)}>
              <ScrollText className="w-5 h-5" />
              Gestión de Bitácora
            </NavLink>
            <NavLink
                to="/jefatura/materias"
                className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`}
                onClick={() => setIsSidebarOpen(false)}
                >
                <BookOpenText className="w-5 h-5" />
                Gestión de Materias
            </NavLink>
            <NavLink
                to="/jefatura/grupos"
                className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`}
                onClick={() => setIsSidebarOpen(false)}
                >
                <Layers className="w-5 h-5" />
                Gestión de Grupos
             </NavLink>
             <NavLink
            to="/jefatura/programacion"
            className={({isActive}) => `${linkBase} ${isActive ? linkActive : ""}`}
            onClick={() => setIsSidebarOpen(false)}
            >
            <CalendarRange className="w-5 h-5" />
            Programación Académica
            </NavLink>
          </nav>

          <div className="mt-auto pt-6">
            <button
              onClick={() => logout()}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1500px] mx-auto">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}
