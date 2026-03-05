import { NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["inventory_2", "Inventario", "/stock"],
  ["shopping_cart", "Ventas", "/ventas"],
  ["receipt_long", "Compras", "/compras"],
  ["group", "Clientes", "/clientes"],
  ["bar_chart", "Reportes", "/reportes"],
  ["settings", "Ajustes", "/ajustes"],
];

function SidebarContent({ onClose }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
          <Icon name="settings_input_component" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">AutoPart Pro</h1>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {navItems.map(([icon, label, to]) => (
            <li key={label}>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
                onClick={onClose}
                to={to}
              >
                <Icon name={icon} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBntIQW3apr8IA5WZVStH3R38-7wjXfkxekVRG1FH3Uocob5ih0r8tGWeEZ5JvBEJq8pXu5F8W-6-iQq4l8ZqfG0NPMRrusutRaNw4V6t_pXh_yGremL9InRADCn376CY27EIoTHBdNfyLlURrBRwlj22-cKvQBGw4ZG_wX152b0sHLt6vbvsi91CwQr-6OUA7YLIsfLtKSDlH554oE5II4siate0uRZCl1xV5UEzYNFx4t5NYCf_YJgV7a0uEVBMp9yZ5X36Qngoiy')",
            }}
          />
          <div className="flex flex-col">
            <p className="text-sm font-bold">Admin User</p>
            <p className="text-xs text-slate-500">Sucursal Norte</p>
          </div>
        </div>

        <button
          className="mt-4 w-full rounded-md bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          type="button"
        >
          Cerrar sesion
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  return (
    <>
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-background-dark lg:flex">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <button aria-label="Cerrar menu lateral" className="absolute inset-0 bg-black/40" onClick={onClose} type="button" />
        <aside className="relative h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-background-dark">
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
