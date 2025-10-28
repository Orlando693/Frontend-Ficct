// === Bitácora API (Vite) ===
// Lee VITE_API_URL y VITE_BYPASS_AUTH desde .env de Vite
const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000/api"

// Si BYPASS_AUTH=true -> NO enviar cookies (evita problemas CORS)
const USE_CREDENTIALS =
  String((import.meta as any).env?.VITE_BYPASS_AUTH || "").toLowerCase() !== "true"

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: USE_CREDENTIALS ? "include" : "omit",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    ...init,
  })
  let json: any = null
  try { json = await res.json() } catch (_) {}
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return json
}

export type ListOptions = { q?: string; page?: number; per_page?: number }

const toRow = (r: any) => ({
  id: r.id,
  modulo: r.modulo,
  accion: r.accion,
  descripcion: r.descripcion ?? null,
  usuario: r.usuario ?? null,
  ip: r.ip ?? null,
  created_at: r.created_at ?? r.at ?? new Date().toISOString(),
})

const unwrapDataArray = (json: any): any[] => {
  if (Array.isArray(json)) return json
  if (json?.data && Array.isArray(json.data)) return json.data
  if (json?.items && Array.isArray(json.items)) return json.items
  return []
}

export async function list(opts: ListOptions = {}) {
  const params = new URLSearchParams()
  if (opts.q) params.set("q", opts.q)
  if (opts.page) params.set("page", String(opts.page))
  if (opts.per_page) params.set("per_page", String(opts.per_page))
  const query = params.toString() ? `?${params.toString()}` : ""
  const json = await apiFetch(`/bitacora${query}`)
  return unwrapDataArray(json).map(toRow)
}

export async function remove(id: number | string) {
  await apiFetch(`/bitacora/${id}`, { method: "DELETE" })
}

export async function clearAll() {
  try {
    await apiFetch(`/bitacora`, { method: "DELETE" }) // ruta oficial
  } catch (e: any) {
    if (String(e?.message || "").includes("404")) {
      await apiFetch(`/bitacora/clear`, { method: "DELETE" }) // fallback
    } else {
      throw e
    }
  }
}
