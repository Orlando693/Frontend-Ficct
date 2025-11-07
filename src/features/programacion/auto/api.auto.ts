import type { AutoRow, AutoSummary } from "./types.auto";

const API = import.meta.env.VITE_API_URL;

function authHeaders(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let j:any=null; try{ j=await res.json(); } catch {}
  throw new Error(j?.message || res.statusText);
}

// PREVIEW (no persiste; arma propuesta)
export async function autoPreview(gestion_id: number) {
  const res = await fetch(`${API}/programacion/auto/preview`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ gestion_id }),
  });
  return handle<{ data: { rows: AutoRow[]; totals: AutoSummary } }>(res);
}

// CONFIRM (persiste asignaciones válidas; registra bitácora)
export async function autoConfirm(gestion_id: number) {
  const res = await fetch(`${API}/programacion/auto/confirm`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ gestion_id }),
  });
  return handle<{ data: { inserted: number; updated: number; skipped: number; errors: number } }>(res);
}
