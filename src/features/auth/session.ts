// Helpers de sesión centralizados
export const TOKEN_KEY = "auth_token";
export const USER_KEY  = "auth_user";   // opcional: guarda {role, name, ...}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUser<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

export function getRole(): string | null {
  const u = getUser<any>();
  // adapta a tu shape de usuario
  return u?.role ?? u?.rol ?? null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveAuth(token: string, user?: any, remember = true) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  if (user) store.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
