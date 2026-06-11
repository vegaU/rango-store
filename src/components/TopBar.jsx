import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { clearSession, getAuthUser } from "../lib/auth";
import { get } from "../lib/api";

export default function TopBar({ onOpenSidebar }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const notifRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  });

  // Apply theme class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  const formattedDate = new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function handleSearchKeyDown(e) {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/ventas?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  async function loadLowStock() {
    setLoadingNotifs(true);
    try {
      const products = await get("/products");
      const safe = Array.isArray(products) ? products : [];
      setLowStockProducts(
        safe.filter((p) => {
          const stock = Number(p.stock) || 0;
          const minStock = Number(p.minStock) || 0;
          if (minStock > 0) return stock <= minStock;
          return stock <= 3;
        }),
      );
    } catch {
      console.error("Error cargando productos para notificaciones");
    } finally {
      setLoadingNotifs(false);
    }
  }

  function handleToggleNotifications() {
    if (!showNotifications) {
      loadLowStock();
    }
    setShowNotifications((prev) => !prev);
  }

  // Load low stock alerts on mount (for badge count)
  useEffect(() => {
    loadLowStock();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
          >
            <Icon name="notifications" className="text-xl" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0b0f19] px-1">
                {lowStockProducts.length}
              </span>
            )}
          </button>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
          >
            <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-xl" />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden z-50">
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alertas de Stock</h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    Cargando...
                  </div>
                ) : lowStockProducts.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {lowStockProducts.map((product) => (
                      <li key={product.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              SKU-{product.id}
                            </p>
                          </div>
                          <div className={`text-xs font-black ${product.stock === 0 ? "text-rose-600" : "text-amber-600"} flex-shrink-0`}>
                            {product.stock === 0 ? "AGOTADO" : `${product.stock} uds.`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Icon name="check_circle" className="text-3xl text-emerald-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Todo en orden</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No hay productos con stock bajo.</p>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/stock");
                  }}
                  type="button"
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Ir al inventario
                </button>
              </div>
            </div>
          )}
        </div>

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