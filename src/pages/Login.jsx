import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa ambos campos");
      return;
    }

    localStorage.setItem("token", "demo_token");
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/20 bg-white/95 p-8 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="settings_input_component" />
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Iniciar sesion</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bienvenido a Rango Store</p>
        </div>

        {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contrasena</label>
            <div className="relative mt-1">
              <input
                className="w-full rounded-md border-slate-300 bg-white pr-10 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? "text" : "password"}
                value={password}
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500"
                onClick={() => setShowPass(!showPass)}
                type="button"
              >
                <Icon name={showPass ? "visibility_off" : "visibility"} />
              </button>
            </div>
          </div>

          <button className="w-full rounded-md bg-primary py-2 font-semibold text-white transition hover:bg-primary/90" type="submit">
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
}
