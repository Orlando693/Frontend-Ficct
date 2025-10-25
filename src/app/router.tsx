import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import Login from "./(public)/page"
import PublicLayout from "./(public)/layout"
import AdminLayout from "./(private)/admin/layout"
import AdminHome from "./(private)/admin/page"
import GestionUsuarios from "./(private)/admin/usuarios/page"

// Habilita bypass solo en desarrollo y cuando la variable lo diga
const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true"

function RequireAuth() {
  const token = localStorage.getItem("auth_token")
  return (token || DEV_BYPASS) ? <Outlet /> : <Navigate to="/" replace />
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
          { path: "/admin/usuarios", element: <GestionUsuarios /> }, // CU1
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])

export default router
