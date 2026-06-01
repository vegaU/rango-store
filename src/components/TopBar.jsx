import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { clearSession, getAuthUser } from "../lib/auth";

export default function TopBar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const formattedDate = new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/50 bg-white/75 px-5 py-4 backdrop-blur-md dark:border-slate-800/40 dark:bg-[#0b0f19]/75 lg:px-8 lg:py-5">
      {/* Title / Date */}
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white lg:hidden shadow-lg shadow-primary/20">
          <Icon name="settings_input_component" className="text-xl" />
        </div>
        <div>
          <h2 className="text-base font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white sm:text-lg lg:text-2xl">
            Panel de Control
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 lg:text-xs">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="mr-3 hidden items-center rounded-xl border border-slate-200/70 bg-slate-50/50 px-3 py-2 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 dark:border-slate-800 dark:bg-slate-900/40 dark:focus-within:border-primary/50 dark:focus-within:bg-slate-900 lg:flex">
          <Icon name="search" className="mr-2 text-slate-400 dark:text-slate-500" />
          <input
            className="w-56 border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-200 dark:placeholder:text-slate-600"
            placeholder="Buscar repuesto..."
            type="text"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-all duration-200">
          <Icon name="notifications" className="text-xl" />
          <span className="absolute right-2.5 top-2.5 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-indigo-500"></span>
          </span>
        </button>

        {/* User Card */}
        <div className="ml-1 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-2.5 py-1.5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div
            className="size-8 rounded-lg bg-cover bg-center ring-2 ring-indigo-500/20"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBntIQW3apr8IA5WZVStH3R38-7wjXfkxekVRG1FH3Uocob5ih0r8tGWeEZ5JvBEJq8pXu5F8W-6-iQq4l8ZqfG0NPMRrusutRaNw4V6t_pXh_yGremL9InRADCn376CY27EIoTHBdNfyLlURrBRwlj22-cKvQBGw4ZG_wX152b0sHLt6vbvsi91CwQr-6OUA7YLIsfLtKSDlH554oE5II4siate0uRZCl1xV5UEzYNFx4t5NYCf_YJgV7a0uEVBMp9yZ5X36Qngoiy')",
            }}
          />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-black text-slate-800 dark:text-white">
              {authUser?.name ?? "Usuario"}
            </p>
            <p className="truncate text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {authUser?.role ?? "Sin rol"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            clearSession();
            navigate("/");
          }}
          className="flex size-10 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition-all duration-200"
          title="Cerrar sesión"
          type="button"
        >
          <Icon name="logout" className="text-xl" />
        </button>

        {/* Mobile menu trigger */}
        {onOpenSidebar && (
          <button
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:hidden transition-all"
            onClick={onOpenSidebar}
            type="button"
          >
            <Icon name="menu" className="text-xl" />
          </button>
        )}
      </div>
    </header>
  );
}
