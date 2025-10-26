export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  // algunos endpoints 204 no devuelven json
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : null;
}
