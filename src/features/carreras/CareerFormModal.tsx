"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Carrera } from "./types"

export default function CareerFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Carrera, "id" | "materiasAsociadas" | "gruposAsociados"> | Partial<Carrera>) => Promise<void>
  initial?: Carrera | null
}) {
  const isEdit = !!initial
  const [nombre, setNombre] = useState("")
  const [sigla, setSigla] = useState("")
  const [estado, setEstado] = useState<Carrera["estado"]>("ACTIVA")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && initial) {
      setNombre(initial.nombre)
      setSigla(initial.sigla)
      setEstado(initial.estado)
      setError(null)
    } else if (open) {
      setNombre("")
      setSigla("")
      setEstado("ACTIVA")
      setError(null)
    }
  }, [open, initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim() || !sigla.trim()) {
      setError("Nombre y sigla son obligatorios.")
      return
    }
    setSaving(true)
    try {
      const payload = isEdit
        ? { ...initial, nombre, sigla: sigla.toUpperCase(), estado }
        : { nombre, sigla: sigla.toUpperCase(), estado }
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
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{isEdit ? "Editar carrera" : "Nueva carrera"}</h3>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Nombre</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Sigla</label>
            <input
              className="w-full border rounded-lg px-3 py-2 uppercase text-sm"
              value={sigla}
              onChange={(e) => setSigla(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Estado</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
            >
              <option value="ACTIVA">ACTIVA</option>
              <option value="INACTIVA">INACTIVA</option>
            </select>
          </div>

          {error && (
            <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
          )}

          <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">
              Cancelar
            </button>
            <button
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
