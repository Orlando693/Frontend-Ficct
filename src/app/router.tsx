import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import PublicLayout from "./(public)/layout"
import Login from "./(public)/page"
import AdminLayout from "./(private)/admin/layout"
import AdminHome from "./(private)/admin/page"
import GestionUsuarios from "./(private)/admin/usuarios/page"
import Reportes from "./(private)/admin/reportes/page"   
import Carreras from "./(private)/admin/carreras/page"        // ← NUEVO
import Bitacora from "./(private)/admin/bitacora/page"

const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true"

function RequireAuth() {
  const token = localStorage.getItem("auth_token")
  return token || DEV_BYPASS ? <Outlet /> : <Navigate to="/" replace />
}

const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: "/", element: <Login /> }] },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminHome /> },
          { path: "/admin/usuarios", element: <GestionUsuarios /> },
          { path: "/admin/reportes", element: <Reportes /> },
          { path: "/admin/carreras", element: <Carreras /> },  
          { path: "/admin/bitacora", element: <Bitacora /> },   // ← NUEVO
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])

export default router
