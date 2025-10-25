import { useEffect, useState } from "react"
import type { Usuario, RolBase } from "./types"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Usuario, "id"> | Partial<Usuario>) => Promise<void>
  initial?: Usuario | null
}

const roles: RolBase[] = ["Decanato", "CPD", "Jefatura", "Docente"]

export default function UserFormModal({ open, onClose, onSubmit, initial }: Props) {
  const isEdit = !!initial
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [username, setUsername] = useState("")
  const [rol, setRol] = useState<RolBase>("Docente")
  const [estado, setEstado] = useState<Usuario["estado"]>("PENDIENTE")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && initial) {
      setNombre(initial.nombre || "")
      setCorreo(initial.correo || "")
      setUsername(initial.username || "")
      setRol(initial.rol || "Docente")
      setEstado(initial.estado || "PENDIENTE")
      setError(null)
    } else if (open) {
      setNombre("")
      setCorreo("")
      setUsername("")
      setRol("Docente")
      setEstado("PENDIENTE")
      setError(null)
    }
  }, [open, initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre || !correo) {
      setError("Nombre y correo son obligatorios.")
      return
    }
    setSaving(true)
    try {
      const payload = isEdit
        ? { ...initial, nombre, correo, username, rol, estado }
        : { nombre, correo, username, rol, estado }
      await onSubmit(payload as any)
      onClose()
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h3>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Nombre</label>
            <input className="w-full border rounded-lg px-3 py-2" value={nombre} onChange={e=>setNombre(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Correo</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2" value={correo} onChange={e=>setCorreo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Usuario (opcional)</label>
            <input className="w-full border rounded-lg px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Rol base</label>
            <select className="w-full border rounded-lg px-3 py-2" value={rol} onChange={e=>setRol(e.target.value as any)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Estado</label>
            <select className="w-full border rounded-lg px-3 py-2" value={estado} onChange={e=>setEstado(e.target.value as any)}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="BLOQUEADO">BLOQUEADO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>

          {error && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancelar</button>
            <button disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white">{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
