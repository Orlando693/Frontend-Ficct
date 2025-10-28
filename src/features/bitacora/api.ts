// ==== Config ====
const API_BASE: string =
  (import.meta as any)?.env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// ==== Auth helpers ====
function getToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

/** Headers siempre como Record<string,string> (evita errores TS) */
function baseHeaders(opts?: { json?: boolean }): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json" };
  if (opts?.json) h["Content-Type"] = "application/json";
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

// ==== Types que vienen del backend
type ApiBitacoraItem = {
  id: number;
  modulo: string;
  accion: string;
  descripcion: string | null;
  usuario: string | null;
  ip: string | null;
  created_at: string; // backend
  entidad?: string | null;
};

// ==== Mapper al shape que usa tu UI (at = created_at)
function toUI(row: ApiBitacoraItem) {
  return { ...row, at: row.created_at };
}

// ==== FUNCIONES con los nombres que usa tu BitacoraPage ====

export async function list() {
  const res = await fetch(`${API_BASE}/bitacora`, {
    method: "GET",
    headers: baseHeaders(),
  });
  if (res.status === 401) throw new Error("AUTH_401");
  if (!res.ok) throw new Error(await res.text());
  const data: ApiBitacoraItem[] = await res.json();
  return data.map(toUI);
}

export async function clearAll() {
  // Intento oficial
  let res = await fetch(`${API_BASE}/bitacora`, {
    method: "DELETE",
    headers: baseHeaders(),
  });
  // Fallback si el backend expone /clear
  if (res.status === 404) {
    res = await fetch(`${API_BASE}/bitacora/clear`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
  }
  if (res.status === 401) throw new Error("AUTH_401");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function remove(id: number | string) {
  const res = await fetch(`${API_BASE}/bitacora/${id}`, {
    method: "DELETE",
    headers: baseHeaders(),
  });
  if (res.status === 401) throw new Error("AUTH_401");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// (opcional) crear manual desde el front
export async function create(payload: {
  modulo: string;
  accion: string;
  descripcion?: string | null;
  usuario?: string | null;
}) {
  const res = await fetch(`${API_BASE}/bitacora`, {
    method: "POST",
    headers: baseHeaders({ json: true }),
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new Error("AUTH_401");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
