import { clearSession, getToken, getTenantSlug } from "./auth";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

export function getTenantSlugFromDomain() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // Only use a subdomain as tenant slug when it looks intentional.
  // Ignore common app hostnames like www, app, dashboard, etc.
  const invalidSubdomains = new Set(["www", "app", "dashboard", "admin"]);

  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    if (invalidSubdomains.has(subdomain)) {
      return null;
    }
    return subdomain;
  }

  return null;
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const token = getToken();
  const storedSlug = getTenantSlug();
  const domainSlug = getTenantSlugFromDomain();
  const tenantSlug = domainSlug || storedSlug;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Add tenant slug header if available
  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function get(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${endpoint}?${query}` : endpoint;
  return request(url, { method: "GET" });
}

export async function post(endpoint, data) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function put(endpoint, data) {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function patch(endpoint, data) {
  return request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function del(endpoint) {
  return request(endpoint, { method: "DELETE" });
}