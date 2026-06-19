const TOKEN_KEY = "token";
const USER_KEY = "auth_user";
const TENANT_SLUG_KEY = "tenant_slug";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
  const rawValue = localStorage.getItem(USER_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function getTenantSlug() {
  return localStorage.getItem(TENANT_SLUG_KEY);
}

export function setTenantSlug(slug) {
  if (slug) {
    localStorage.setItem(TENANT_SLUG_KEY, slug);
  } else {
    localStorage.removeItem(TENANT_SLUG_KEY);
  }
}

export function saveSession(session) {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  // Save tenant_slug if present in session
  if (session.tenant_slug) {
    localStorage.setItem(TENANT_SLUG_KEY, session.tenant_slug);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Keep tenant_slug in localStorage so it persists across sessions for the same tenant
  // (unless it's extracted from the domain, in which case it doesn't matter)
}
