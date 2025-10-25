import { createBrowserRouter, Navigate } from "react-router-dom"
import PublicLayout from "./(public)/layout"
import PrivateLayout from "./(private)/admin/layout"
import Login from "./(public)/page"
import Dashboard from "./(private)/admin/page"

import Carreras from "./(private)/admin/carreras/page.tsx"
import Materias from "./(private)/admin/materias/page"
import Grupos from "./(private)/admin/grupos/page"
import Aulas from "./(private)/admin/aulas/page"
import Horarios from "./(private)/admin/horarios/page"
import Asistencia from "./(private)/admin/asistencia/page"
import Reportes from "./(private)/admin/reportes/page"
import Bitacora from "./(private)/admin/bitacora/page"
import Usuarios from "./(private)/admin/usuarios/page"
import Roles from "./(private)/admin/roles/page"
import Perfiles from "./(private)/admin/perfiles/page"
import Parametros from "./(private)/admin/parametros/page"
import Importar from "./(private)/admin/importar/page"

import DispAulas from "./consultas/disponibilidad/page"
import HorariosPub from "./consultas/horarios/page"

const withAuth = (el: JSX.Element) => (localStorage.getItem("token") ? el : <Navigate to="/login" replace />)

export default createBrowserRouter([
  { element: <PublicLayout />, children: [
      { path: "/login", element: <Login /> },
      { path: "/consultas/disponibilidad-aulas", element: <DispAulas /> },
      { path: "/consultas/horarios-publicados", element: <HorariosPub /> },
  ]},
  { element: withAuth(<PrivateLayout />), children: [
      { index: true, element: <Dashboard /> },
      { path: "/admin/carreras", element: <Carreras /> },
      { path: "/admin/materias", element: <Materias /> },
      { path: "/admin/grupos", element: <Grupos /> },
      { path: "/admin/aulas", element: <Aulas /> },
      { path: "/admin/horarios", element: <Horarios /> },
      { path: "/admin/asistencia", element: <Asistencia /> },
      { path: "/admin/reportes", element: <Reportes /> },
      { path: "/admin/bitacora", element: <Bitacora /> },
      { path: "/admin/usuarios", element: <Usuarios /> },
      { path: "/admin/roles", element: <Roles /> },
      { path: "/admin/perfiles", element: <Perfiles /> },
      { path: "/admin/parametros", element: <Parametros /> },
      { path: "/admin/importar-oferta", element: <Importar /> },
      { path: "*", element: <Navigate to="/" replace /> },
  ]},
])
