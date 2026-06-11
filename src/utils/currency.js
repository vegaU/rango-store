export function formatGs(value) {
  return `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`;
}

export function formatGsInput(value) {
  if (value === null || value === undefined || value === "") return "";
  // Keep only digits
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("es-PY").format(Number(clean));
}

export function parseGs(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  // Keep only digits
  const clean = String(value).replace(/\D/g, "");
  return Number(clean) || 0;
}
