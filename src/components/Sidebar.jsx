import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { canAccessRoute } from "../lib/permissions";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["inventory_2", "Inventario", "/stock"],
  ["category", "Categorias", "/categorias"],
  ["shopping_cart", "Ventas", "/ventas"],
  ["receipt_long", "Compras", "/compras"],
  ["group", "Clientes", "/clientes"],
  ["bar_chart", "Reportes", "/reportes"],
  ["settings", "Ajustes", "/ajustes"],
];

function SidebarContent({ onClose }) {
  const visibleNavItems = navItems.filter(([, , to]) => canAccessRoute(to));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
          <Icon name="settings_input_component" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Rango Store</h1>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {visibleNavItems.map(([icon, label, to]) => (
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
    </div>
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
