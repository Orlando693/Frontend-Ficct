import type { ParametrosDTO } from "./types";

const BASE = `${import.meta.env.VITE_API_URL}/parametros-academicos`;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let data: any = null;
  try { data = await res.json(); } catch {}
  throw new Error(data?.message || res.statusText);
}

export async function getParametros() {
  const res = await fetch(BASE, { headers: authHeaders() });
  return handle<{ data: ParametrosDTO }>(res);
}

export async function saveParametros(p: ParametrosDTO) {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(p),
  });
  return handle<{ data: ParametrosDTO }>(res);
}
