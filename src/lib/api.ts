// frontend/src/lib/api.ts

// Base del backend desde Vite, con fallback local
const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// Lee token desde ambos storages (recordarme o no)
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") ?? sessionStorage.getItem("auth_token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Manejo amigable de sesión expirada
  if (res.status === 401) {
    try {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    } catch {}
    const txt = await res.text().catch(() => "");
    throw new Error(`Sesión expirada o no autenticado. ${txt}`);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}
