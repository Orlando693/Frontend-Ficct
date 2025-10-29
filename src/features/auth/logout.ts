import { clearAuth, getToken } from "./session";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8080/api";

/**
 * Cierra sesión tanto en el backend (si existe /auth/logout)
 * como en el frontend (limpia storages) y redirige al login.
 */
export async function logout() {
  const token = getToken();

  try {
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {}); // si no existe el endpoint, lo ignoramos
    }
  } finally {
    clearAuth();                 // 🧹 borra local + session storage
    window.location.replace("/"); // 🔁 vete al login
  }
}
