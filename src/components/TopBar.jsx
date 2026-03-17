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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/85 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white lg:hidden">
          <Icon name="settings_input_component" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight lg:text-2xl">Panel de Control</h2>
          <p className="text-xs capitalize text-slate-500 lg:text-sm">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-4 hidden items-center rounded-lg border border-slate-200 bg-background-light px-3 py-2 dark:border-slate-700 dark:bg-slate-800 lg:flex">
          <Icon name="search" className="mr-2 text-slate-500" />
          <input className="w-64 border-none bg-transparent text-sm focus:ring-0" placeholder="Buscar repuesto..." type="text" />
        </div>

        <button className="flex size-10 items-center justify-center rounded-full text-[#111318] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
          <Icon name="notifications" />
        </button>

        <div className="ml-1 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div
            className="size-9 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBntIQW3apr8IA5WZVStH3R38-7wjXfkxekVRG1FH3Uocob5ih0r8tGWeEZ5JvBEJq8pXu5F8W-6-iQq4l8ZqfG0NPMRrusutRaNw4V6t_pXh_yGremL9InRADCn376CY27EIoTHBdNfyLlURrBRwlj22-cKvQBGw4ZG_wX152b0sHLt6vbvsi91CwQr-6OUA7YLIsfLtKSDlH554oE5II4siate0uRZCl1xV5UEzYNFx4t5NYCf_YJgV7a0uEVBMp9yZ5X36Qngoiy')",
            }}
          />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{authUser?.name ?? "Usuario"}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{authUser?.role ?? "Sin rol"}</p>
          </div>
        </div>

        <button
          onClick={() => {
            clearSession();
            navigate("/");
          }}
          className="flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Cerrar sesion"
          type="button"
        >
          <Icon name="logout" />
        </button>

        {onOpenSidebar && (
          <button
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={onOpenSidebar}
            type="button"
          >
            <Icon name="menu" />
          </button>
        )}
      </div>
    </header>
  );
}
