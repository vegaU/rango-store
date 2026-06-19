import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import { post } from "../lib/api";
import { getToken, getTenantSlug, saveSession, setTenantSlug } from "../lib/auth";
import { getTenantSlugFromDomain } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [tenantSlug, setTenantSlugLocal] = useState(getTenantSlug() || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if tenant slug is already determined from domain
  const domainSlug = getTenantSlugFromDomain();
  const showTenantField = !domainSlug;

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa ambos campos");
      return;
    }

    if (showTenantField && !tenantSlug) {
      setError("Por favor ingresa el código de la tienda");
      return;
    }

    // Save tenant slug before making the request so it's available in api.js
    if (tenantSlug) {
      setTenantSlug(tenantSlug);
    }

    setIsSubmitting(true);
    setError("");

    try {
      const session = await post("/auth/login", {
        email,
        password,
      });

      saveSession(session);
      navigate("/dashboard");
    } catch {
      setError("Credenciales inválidas");
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

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-[32px] border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] p-8 shadow-xl backdrop-blur-xl ring-1 ring-white/15 dark:ring-slate-700/30 sm:p-10 transform transition-transform duration-500 hover:scale-[1.02]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 ring-4 ring-primary/10">
            <Icon name="settings_input_component" className="text-2xl" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-lg font-semibold tracking-wide text-slate-800 dark:text-slate-200">Bienvenido a Rango Store</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <Icon name="error" className="text-base" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {showTenantField && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
                Código de Tienda
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Icon name="store" className="text-lg" />
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => setTenantSlugLocal(e.target.value)}
                  placeholder="default"
                  type="text"
                  value={tenantSlug}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Email
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="mail" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@rango.com"
                type="email"
                required
                value={email}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)]">
              Contraseña
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="lock" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-[var(--color-input-border-light)] dark:border-[var(--color-input-border-dark)] bg-[var(--color-input-bg-light)] dark:bg-[var(--color-input-bg-dark)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-input-text-light)] dark:text-[var(--color-input-text-dark)] placeholder:text-[var(--color-placeholder-light)] dark:placeholder:text-[var(--color-placeholder-dark)] shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type={showPass ? "text" : "password"}
                required
                value={password}
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
            className="mt-2 w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Validando...
              </span>
            ) : (
              "Acceder"
            )}
          </button>
        </form>

        {/* Link to Register */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes una tienda?{" "}
          <Link to="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Crear Tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
