import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"

// Público
import Login from "./(public)/page"

// Admin
import AdminLayout from "./(private)/admin/layout"
import AdminHome from "./(private)/admin/page"
import GestionUsuarios from "./(private)/admin/usuarios/page"
import Reportes from "./(private)/admin/reportes/page"
import Carreras from "./(private)/admin/carreras/page"
import Bitacora from "./(private)/admin/bitacora/page"

// Jefatura
import JefaturaLayout from "./(private)/jefatura/layout"
import JefaturaHome from "./(private)/jefatura/page"

// Decanato
import DecanatoLayout from "./(private)/decanato/layout"
import DecanatoHome from "./(private)/decanato/page"

// Docente
import DocenteLayout from "./(private)/docente/layout"
import DocenteHome from "./(private)/docente/page"

import { isAuthenticated } from "../features/auth/session"
import JefaturaMateriasPage from "./(private)/jefatura/materias/page"
import JefaturaGruposPage from "./(private)/jefatura/grupos/page"
import AdminAulasPage from "./(private)/admin/aulas/page";
import AdminParametrosPage from "./(private)/admin/parametros/page";
import JefaturaProgramacionPage from "./(private)/jefatura/programacion/page";
import JefaturaProgAutoPage from "./(private)/jefatura/programacion/auto/page";
import JefaturaProgDispPage from "./(private)/jefatura/programacion/disponibilidad/page";
import DocenteAsistenciaPage from "./(private)/docente/asistencia/page";

const DEV_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true"

function RequireAuth() {
  const ok = isAuthenticated() || DEV_BYPASS
  return ok ? <Outlet /> : <Navigate to="/" replace />
}

const router = createBrowserRouter([
  // Login público
  { path: "/", element: <Login /> },

  // Bloque privado protegido
  {
    element: <RequireAuth />,
    children: [
      // ADMIN
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminHome /> },
          { path: "usuarios", element: <GestionUsuarios /> },
          { path: "reportes", element: <Reportes /> },
          { path: "carreras", element: <Carreras /> },
          { path: "aulas", element: <AdminAulasPage /> },
          { path: "parametros", element: <AdminParametrosPage /> },
          { path: "bitacora", element: <Bitacora /> },
        ],
      },

      // JEFATURA
      {
        path: "/jefatura",
        element: <JefaturaLayout />,
        children: [
          { index: true, element: <JefaturaHome /> },
          { path: "materias", element: <JefaturaMateriasPage /> },
          { path: "grupos", element: <JefaturaGruposPage /> },
          { path: "programacion", element: <JefaturaProgramacionPage /> },
          { path: "programacion/auto", element: <JefaturaProgAutoPage /> },  
          { path: "programacion/disponibilidad", element: <JefaturaProgDispPage /> },
          { path: "reportes", element: <Reportes /> },
          { path: "bitacora", element: <Bitacora /> },
        ],
      },

      // DECANATO
      {
        path: "/decanato",
        element: <DecanatoLayout />,
        children: [
          { index: true, element: <DecanatoHome /> },
          // Reusamos tus páginas existentes
          { path: "reportes", element: <Reportes /> },
          { path: "bitacora", element: <Bitacora /> },
        ],
      },

      // DOCENTE
      {
        path: "/docente",
        element: <DocenteLayout />,
        children: [
          { index: true, element: <DocenteHome /> },
          // Placeholders para no romper mientras creas las páginas reales
          { path: "horario", element: <div className="p-6">Mi horario (en construcción)</div> },
         
          { path: "asistencia", element: <DocenteAsistenciaPage /> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
  
])

export default router
