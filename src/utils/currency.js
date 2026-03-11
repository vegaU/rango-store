export function formatGs(value) {
  return `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`;
}
