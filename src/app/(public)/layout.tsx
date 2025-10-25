import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Users, LogOut } from "lucide-react"

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200/90 hover:text-white hover:bg-white/10"
const linkActive =
  "bg-white/15 text-white shadow-inner"

export default function AdminLayout() {
  const role = localStorage.getItem("role") || "CPD"

  return (
    // 🔒 sin desborde y ancho al 100% de la ventana
    <div className="min-h-dvh w-screen overflow-x-hidden bg-slate-50">
      <div className="grid grid-cols-[260px_1fr]">
        {/* SIDEBAR */}
        <aside className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-4 min-h-dvh">
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
            <NavLink
              to="/admin"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Resumen
            </NavLink>

            <NavLink
              to="/admin/usuarios"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </NavLink>
          </nav>

          <div className="mt-auto pt-6">
            <button
              onClick={() => {
                localStorage.removeItem("auth_token")
                localStorage.removeItem("role")
                window.location.assign("/")
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <section className="p-6 overflow-x-hidden">
          {/* contenedor centrado y acotado: evita que algo “empuje” el ancho */}
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}
