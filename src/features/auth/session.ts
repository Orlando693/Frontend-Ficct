// src/features/auth/session.ts
export const TOKEN_KEY = "auth_token";
export const USER_KEY  = "auth_user"; // guarda el usuario completo { id, nombre, rol, ... }

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUser<T = any>(): T | null {
  try {
    const raw =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getRole(): string | null {
  const u: any = getUser();
  const roleFromUser = u?.rol ?? u?.role ?? null;

  const roleMirror =
    localStorage.getItem("role") || sessionStorage.getItem("role");

  return (roleFromUser || roleMirror || null) as string | null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveAuth(token: string, user?: any, remember = true) {
  const main = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  // guarda en el storage elegido
  main.setItem(TOKEN_KEY, token);
  if (user) {
    main.setItem(USER_KEY, JSON.stringify(user));
    const role = user?.rol ?? user?.role;
    if (role) main.setItem("role", role); // espejo por compatibilidad
  }

  // limpia el otro storage para no mezclar
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  other.removeItem("role");
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("role");
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem("role");
}
