import { useState } from "react"
import { Calendar, Shield, Clock, Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  if (!email || !password) {
    setError("Por favor ingresa tu correo y contraseña.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", // evita 419
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 403) throw new Error("Cuenta bloqueada o inactiva.");
      if (res.status === 422) throw new Error("Revisa correo y contraseña.");
      throw new Error(txt || "No se pudo iniciar sesión.");
    }

    const data = await res.json();

    // Si marcó “Recordarme” guarda en localStorage; si no, en sessionStorage
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", data.token);
    storage.setItem("role", data.user?.rol ?? "");

    // Tu redirección por rol (igual que ya la tienes)
    const path: Record<string, string> = {
      Decanato: "/admin",
      CPD: "/admin",
      Jefatura: "/admin",
      Docente: "/admin",
    };
    window.location.assign(path[data.user?.rol] || "/admin");
  } catch (err: any) {
    setError(err?.message || "No se pudo iniciar sesión.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-dvh w-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[48%_52%] bg-white">
      {/* IZQUIERDA: bienvenida */}
      <section className="bg-slate-900 text-white">
        <div className="h-full flex items-center p-8 xl:p-14">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> FICCT Sistema Académico
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Planificación Académica Inteligente</h1>
            <p className="mt-3 text-slate-300">
              Gestiona horarios, aulas y asistencia. Acceso para Decanato, CPD, Jefatura y Docentes.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10"><Calendar className="w-5 h-5 text-blue-300" /></span>
                <div>
                  <p className="font-medium">Evita conflictos de horarios</p>
                  <p className="text-sm text-slate-400">Disponibilidad de aulas y docentes en tiempo real</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10"><Shield className="w-5 h-5 text-blue-300" /></span>
                <div>
                  <p className="font-medium">Control por roles</p>
                  <p className="text-sm text-slate-400">Permisos según tu función</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10"><Clock className="w-5 h-5 text-blue-300" /></span>
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

      {/* DERECHA: login (centrado suave, leve sesgo a la izquierda) */}
      <section className="bg-slate-50 flex items-center justify-center">
        {/* - Centramos con justify-center
            - Y movemos un poquito a la izquierda con lg:-ml-6 */}
        <div className="w-full max-w-md px-6 md:px-10 lg:px-12 lg:-ml-6">
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Iniciar sesión</h2>
            <p className="text-slate-600">Ingresa tus credenciales para acceder al sistema</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ficct.edu.bo"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg
                             text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-300 rounded-lg
                             text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
              className="w-full px-4 py-3 bg-slate-900 text-white font-medium rounded-lg
                         hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
