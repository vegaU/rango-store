import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { post } from "../lib/api";
import { getToken, saveSession } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Dynamic Animated Glowing Circles */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-[35rem] w-[35rem] rounded-full bg-primary/15 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[35rem] w-[35rem] rounded-full bg-indigo-600/15 blur-[120px] animate-float-reverse-slow" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-slow" />

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/60 sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 ring-4 ring-primary/10">
            <Icon name="settings_input_component" className="text-2xl" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Bienvenido a Rango Store
          </p>
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="mail" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-primary dark:focus:bg-slate-950"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@rango.com"
                type="email"
                required
                value={email}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contraseña
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Icon name="lock" className="text-lg" />
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-primary dark:focus:bg-slate-950"
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
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:from-primary/95 hover:to-indigo-500 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </div>
  );
}
