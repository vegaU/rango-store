import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { canAccessRoute } from "../lib/permissions";
import { getAuthUser } from "../lib/auth";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["inventory_2", "Productos", "/stock"],
  ["category", "Categorías", "/categorias"],
  ["shopping_cart", "Ventas", "/ventas"],
  ["receipt_long", "Compras", "/compras"],
  ["group", "Clientes", "/clientes"],
  ["store", "Proveedores", "/proveedores"],
  ["bar_chart", "Reportes", "/reportes"],
  ["domain", "Empresas", "/empresas"],
  ["settings", "Ajustes", "/ajustes"],
];

function SidebarContent({ onClose }) {
  const authUser = getAuthUser();
  const companyName = authUser?.tenantName ?? authUser?.companyName ?? "Panel de Control";
  const visibleNavItems = navItems.filter(([, , to]) => canAccessRoute(to));

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-slate-50/50 dark:from-[#0b0f19] dark:to-[#0f172a]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 ring-2 ring-primary/20">
          <Icon name="settings_input_component" className="text-xl" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent dark:from-white dark:to-indigo-200">
            {companyName}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 dark:text-primary">
            Control Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <ul className="space-y-1.5">
          {visibleNavItems.map(([icon, label, to]) => (
            <li key={label}>
              <NavLink
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl py-3 px-4 transition-all duration-200 ${isActive
                    ? "bg-primary/8 font-bold text-primary shadow-sm border-l-4 border-primary pl-3 dark:bg-primary/10"
                    : "text-slate-500 pl-4 hover:bg-slate-100 hover:text-slate-800 hover:pl-5.5 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                  }`
                }
                onClick={onClose}
                to={to}
              >
                <Icon
                  name={icon}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                <span className="text-sm font-medium tracking-wide">{label}</span>
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
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 flex-col border-r border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-[#0b0f19] lg:flex">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <button
          aria-label="Cerrar menu lateral"
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          type="button"
        />
        <aside className="relative h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0b0f19] transition-transform duration-300">
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
