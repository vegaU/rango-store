import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { canAccessRoute } from "../lib/permissions";

export default function BottomNav() {
  const items = [
    ["dashboard", "Panel", "/dashboard"],
    ["inventory_2", "Stock", "/stock"],
    ["shopping_cart", "Ventas", "/ventas"],
    ["group", "Clientes", "/clientes"],
    ["more_horiz", "Mas", "/menu"],
  ];
  const visibleItems = items.filter(([, , to]) => canAccessRoute(to));

  return (
    <nav className="fixed bottom-0 left-0 z-30 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/95 lg:hidden">
      {visibleItems.map(([icon, label, to]) => (
        <NavLink
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 ${
              isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"
            }`
          }
          key={label}
          to={to}
        >
          <Icon name={icon} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
