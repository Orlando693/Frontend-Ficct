import type { ServerPreviewDTO } from "./types.importar";

const API = import.meta.env.VITE_API_URL;

function authHeaders(extra: Record<string,string> = {}) {
  const h: Record<string,string> = { ...extra };
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let j: any = null; try { j = await res.json(); } catch {}
  throw new Error(j?.message || res.statusText);
}

// opcional: si vas a servir una plantilla desde backend, devuelve su URL.
// Si no, usa la plantilla local que genera el componente.
export function downloadPlantillaURL(_formato: "csv" | "xlsx" = "csv") {
  return null;
}

export async function serverPreview(file: File, gestion_id: number) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("gestion_id", String(gestion_id));
  const res = await fetch(`${API}/importar/oferta/preview`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });
  return handle<{ data: ServerPreviewDTO }>(res);
}

export async function serverConfirm(file: File, gestion_id: number) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("gestion_id", String(gestion_id));
  const res = await fetch(`${API}/importar/oferta/confirm`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });
  return handle<{ data: { inserted: number; updated: number; skipped: number; errors: number } }>(res);
}
