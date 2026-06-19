import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import { post } from "../lib/api";
import { getToken } from "../lib/auth";

export default function RegisterCompany() {
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  if (getToken()) {
    navigate("/dashboard");
    return null;
  }

  const handleSlugChange = (value) => {
    // Auto-generate slug from company name: lowercase, replace spaces with hyphens, remove special chars
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones del lado del cliente
    if (!companyName || !slug || !adminName || !adminEmail || !adminPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (adminPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await post("/tenants/register", {
        companyName: companyName.trim(),
        slug: slug.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      setSuccess(
        `¡Tienda "${result.tenant.name}" creada exitosamente! Ahora puedes iniciar sesión.`
      );

      // Reset form
      setCompanyName("");
      setSlug("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al registrar la tienda. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] px-4 py-12">
      {/* Dynamic Animated Glowing Circles */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-[35rem] w-[35rem] rounded-full bg-primary/15 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[35rem] w-[35rem] rounded-full bg-indigo-600/15 blur-[120px] animate-float-reverse-slow" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-slow" />

      {/* Register Card */}
      <div className="relative w-full max-w-md rounded-[32px] border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] p-8 shadow-xl backdrop-blur-xl ring-1 ring-white/15 dark:ring-slate-700/30 sm:p-10 transform transition-transform duration-500 hover:scale-[1.02]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 ring-4 ring-primary/10">
            <Icon name="store" className="text-2xl" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Crear Tienda
          </h1>
          <p className="mt-2 text-lg font-semibold tracking-wide text-slate-800 dark:text-slate-200">
            Registra tu empresa en Rango Store
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <Icon name="error" className="text-base" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <Icon name="check_circle" className="text-base" />
            <p>{success}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Nombre de la Tienda
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="business" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  handleSlugChange(e.target.value);
                }}
                placeholder="Mi Tienda"
                type="text"
                value={companyName}
                required
              />
            </div>
          </div>

          {/* Slug (auto-generated) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Slug (código único de tienda)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="link" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mi-tienda"
                type="text"
                value={slug}
                required
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Se genera automáticamente. Se usará para identificar tu tienda.
            </p>
          </div>

          {/* Admin Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Nombre del Administrador
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="person" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Juan Pérez"
                type="text"
                value={adminName}
                required
              />
            </div>
          </div>

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Email del Administrador
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="mail" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@mitienda.com"
                type="email"
                value={adminEmail}
                required
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Contraseña del Administrador
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="lock" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                type={showPass ? "text" : "password"}
                value={adminPassword}
                required
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => setShowPass(!showPass)}
                type="button"
              >
                <Icon name={showPass ? "visibility_off" : "visibility"} className="text-lg" />
              </button>
            </div>
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </span>
            ) : (
              "Crear Tienda"
            )}
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes una tienda?{" "}
          <Link to="/" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}