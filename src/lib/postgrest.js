const baseUrl = import.meta.env.VITE_POSTGREST_URL?.replace(/\/+$/, "") ?? "";
const schema = import.meta.env.VITE_POSTGREST_SCHEMA ?? "public";
const apiKey = import.meta.env.VITE_POSTGREST_API_KEY ?? "";

function buildHeaders(extraHeaders = {}) {
  const headers = {
    Accept: "application/json",
    ...extraHeaders,
  };

  if (schema) {
    headers["Accept-Profile"] = schema;
    headers["Content-Profile"] = schema;
  }

  if (apiKey) {
    headers.apikey = apiKey;
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function isPostgrestConfigured() {
  return Boolean(baseUrl);
}

export async function listRows(resource, params = {}, init = {}) {
  if (!baseUrl) {
    throw new Error("Missing VITE_POSTGREST_URL");
  }

  const response = await fetch(`${baseUrl}/${resource}${buildQuery(params)}`, {
    method: "GET",
    headers: buildHeaders(init.headers),
    signal: init.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `PostgREST request failed with status ${response.status}`);
  }

  return response.json();
}
