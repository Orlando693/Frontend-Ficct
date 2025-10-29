import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import Login from "./(public)/page"
import AdminLayout from "./(private)/admin/layout"
import AdminHome from "./(private)/admin/page"
import GestionUsuarios from "./(private)/admin/usuarios/page"
import Reportes from "./(private)/admin/reportes/page"
import Carreras from "./(private)/admin/carreras/page"
import Bitacora from "./(private)/admin/bitacora/page"

// 👇 usa el mismo helper que el login (lee localStorage y sessionStorage)
import { isAuthenticated } from "../features/auth/session"

const DEV_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true"

function RequireAuth() {
  const ok = isAuthenticated() || DEV_BYPASS
  return ok ? <Outlet /> : <Navigate to="/" replace />
}

const router = createBrowserRouter([
  // Login público
  { path: "/", element: <Login /> },

  // Bloque privado
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          // /admin
          { index: true, element: <AdminHome /> },
          // /admin/usuarios
          { path: "usuarios", element: <GestionUsuarios /> },
          // /admin/reportes
          { path: "reportes", element: <Reportes /> },
          // /admin/carreras
          { path: "carreras", element: <Carreras /> },
          // /admin/bitacora
          { path: "bitacora", element: <Bitacora /> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
])

export default router
