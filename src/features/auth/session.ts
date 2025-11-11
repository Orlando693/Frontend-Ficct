export const TOKEN_KEY = "auth_token";
export const USER_KEY  = "auth_user";
export const ROLE_KEY  = "role";
export const ABIL_KEY  = "abilities";

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
  const fromUser = u?.rol ?? u?.role ?? null;
  const mirror =
    localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY);
  return (fromUser || mirror || null) as string | null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveAuth(token: string, user?: any, abilities?: any, remember = true) {
  const main = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  main.setItem(TOKEN_KEY, token);
  if (user) {
    try { main.setItem(USER_KEY, JSON.stringify(user)); } catch {}
    const role = user?.rol ?? user?.role;
    if (role) main.setItem(ROLE_KEY, role);
  }
  if (abilities) {
    try { main.setItem(ABIL_KEY, JSON.stringify(abilities)); } catch {}
  }

  // limpia el otro storage para no mezclar sesiones
  [TOKEN_KEY, USER_KEY, ROLE_KEY, ABIL_KEY].forEach(k => other.removeItem(k));
}

export function clearAuth() {
  const extraKeys = ['token', 'access_token'];
  [TOKEN_KEY, USER_KEY, ROLE_KEY, ABIL_KEY, ...extraKeys].forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}
