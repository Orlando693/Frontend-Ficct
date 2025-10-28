// Modo demo/mocks para DEV. Intercepta window.fetch.
const ORIG_FETCH = window.fetch.bind(window);

// Cambia a false cuando el backend esté OK
const FORCE_MOCK = true;

let __mockId = 1000;
const MOCK_DB = {
  carreras: [
    {
      id_carrera: 999,
      nombre: "(demo) Ingeniería Informática",
      sigla: "SIS",
      codigo: "SIS",
      estado: "ACTIVA",
      materias_asociadas: 0,
      grupos_asociados: 0,
      _mock: true,
    },
  ],
  docentes: [
    { id_persona: 1, nombre: "Docente", apellido: "Demo", username: "ddemo" },
  ],
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleMock(urlStr: string, init?: RequestInit): Promise<Response> {
  const u = new URL(urlStr);
  const path = u.pathname; // p.ej. /api/carreras
  const method = (init?.method || "GET").toUpperCase();
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  // --- Carreras ---
  if (path.startsWith("/api/carreras")) {
    if (method === "GET") {
      return jsonResponse(MOCK_DB.carreras);
    }
    if (method === "POST") {
      const row = {
        id_carrera: __mockId++,
        nombre: body?.nombre ?? "(sin nombre)",
        sigla: body?.sigla ?? "SN",
        codigo: body?.codigo ?? body?.sigla ?? "SN",
        estado: body?.estado ?? "ACTIVA",
        materias_asociadas: 0,
        grupos_asociados: 0,
        _mock: true,
      };
      MOCK_DB.carreras.unshift(row);
      return jsonResponse(row, 201);
    }
    if (method === "PUT") {
      const match = path.match(/\/api\/carreras\/(\d+)/);
      const id = match ? Number(match[1]) : NaN;
      const idx = MOCK_DB.carreras.findIndex(c => c.id_carrera === id);
      if (idx >= 0) {
        MOCK_DB.carreras[idx] = { ...MOCK_DB.carreras[idx], ...body };
        return jsonResponse(MOCK_DB.carreras[idx]);
      }
      return jsonResponse({ ok: true });
    }
    if (method === "PATCH" || method === "DELETE") {
      return jsonResponse({ ok: true });
    }
  }

  // --- Reportes / Docentes (tu front llama a /reportes/docentes y /users?rol=Docente&estado=ACTIVO) ---
  if (path.includes("/api/reportes/docentes") || path.includes("/api/users")) {
    return jsonResponse(MOCK_DB.docentes);
  }

  // Default
  return jsonResponse([]);
}

// Interceptor: usa mock si FORCE_MOCK es true, o si falla el fetch real
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

  if (FORCE_MOCK && url.includes("/api/")) {
    console.warn("[DEV MOCK] forzado →", url);
    return handleMock(url, init);
  }

  try {
    const res = await ORIG_FETCH(input, init);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res;
  } catch (e) {
    if (url.includes("/api/")) {
      console.warn("[DEV MOCK] fallback (backend caído) →", url, e);
      return handleMock(url, init);
    }
    throw e;
  }
};
