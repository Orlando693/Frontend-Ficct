export const API = import.meta.env.VITE_API_URL || "http://localhost:8080"
export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<T>
}
