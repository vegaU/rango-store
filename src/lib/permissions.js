import { getAuthUser } from "./auth";

export function isSuperAdmin() {
  return getAuthUser()?.role === "super_admin";
}

export function isAdmin() {
  return getAuthUser()?.role === "admin";
}

export function isCajero() {
  return getAuthUser()?.role === "cajero";
}

export function hasAnyRole(roles = []) {
  const role = getAuthUser()?.role;
  return Boolean(role && roles.includes(role));
}

export function canAccessRoute(pathname) {
  const role = getAuthUser()?.role;
  if (!role) {
    return false;
  }

  const accessByRoute = {
    "/dashboard": ["super_admin", "admin", "cajero"],
    "/stock": ["admin", "cajero"],
    "/ventas": ["admin", "cajero"],
    "/clientes": ["admin", "cajero"],
    "/categorias": ["admin"],
    "/compras": ["admin"],
    "/reportes": ["admin"],
    "/ajustes": ["admin"],
    "/proveedores": ["admin"],
    "/empresas": ["super_admin"],
    "/menu": ["admin", "cajero"],
  };

  return accessByRoute[pathname]?.includes(role) ?? false;
}
