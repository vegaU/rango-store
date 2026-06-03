import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { get } from "../lib/api";
import { formatGs } from "../utils/currency";

const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildTrendSeries(sales) {
  const now = new Date();
  const series = [];

  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const total = sales.reduce((sum, sale) => {
      const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        return sum;
      }

      return createdAt.getMonth() === month && createdAt.getFullYear() === year ? sum + (Number(sale.total) || 0) : sum;
    }, 0);

    series.push(total);
  }

  return series;
}

function buildChartPath(values, width = 472, height = 148) {
  if (!values.length) {
    return "";
  }

  const max = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = Number((index * stepX).toFixed(2));
      const y = Number((height - (value / max) * (height - 12) - 6).toFixed(2));
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(linePath, width = 472, height = 148) {
  if (!linePath) {
    return "";
  }

  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

function getSaleIcon(total) {
  const amount = Number(total) || 0;
  if (amount >= 1000000) {
    return "sell";
  }
  if (amount >= 500000) {
    return "shopping_cart";
  }
  return "receipt_long";
}

function getSaleStatusClass(createdAt) {
  const date = createdAt ? new Date(createdAt) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return { text: "Sin fecha", className: "text-slate-500" };
  }

  const today = startOfToday();
  return date >= today
    ? { text: "Hoy", className: "text-emerald-600" }
    : { text: date.toLocaleDateString("es-PY"), className: "text-slate-500" };
}

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [chartTotal, setChartTotal] = useState(0);
  const [chartDelta, setChartDelta] = useState(0);
  const [chartValues, setChartValues] = useState([0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [salesData, productsData, customersData] = await Promise.all([
          get("/sales"),
          get("/products"),
          get("/customers"),
        ]);

        const sales = Array.isArray(salesData) ? salesData : [];
        const products = Array.isArray(productsData) ? productsData : [];
        const customers = Array.isArray(customersData) ? customersData : [];

        const today = startOfToday();
        const monthStart = startOfMonth();
        const salesToday = sales
          .filter((sale) => {
            const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
            return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= today;
          })
          .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
        const lowStock = products.filter((product) => {
          const stock = Number(product.stock ?? 0);
          return !Number.isNaN(stock) && stock <= 5;
        }).length;
        const pendingOrders = 0;
        const newCustomers = customers.filter((customer) => {
          const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
          return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart;
        }).length;

        setStats([
          { icon: "payments", iconWrap: "bg-emerald-100 text-emerald-600", value: formatGs(salesToday), label: "Ventas hoy" },
          {
            icon: "warning",
            iconWrap: "bg-amber-100 text-amber-600",
            value: `${lowStock} Artículos`,
            label: "Bajos en stock",
            onClick: () => navigate("/stock?filter=lowStock"),
          },
          { icon: "assignment_late", iconWrap: "bg-blue-100 text-blue-600", value: pendingOrders.toString(), label: "Pendientes" },
          { icon: "person_add", iconWrap: "bg-violet-100 text-violet-600", value: newCustomers.toString(), label: "Clientes nuevos" },
        ]);

        const customerById = new Map(customers.map((customer) => [customer.id, customer.name]));
        const normalizedRecentSales = [...sales]
          .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
          .slice(0, 5)
          .map((sale) => {
            const status = getSaleStatusClass(sale.createdAt);

            return {
              id: sale.id,
              icon: getSaleIcon(sale.total),
              title: `VTA-${sale.id}`,
              customer: customerById.get(sale.customerId) ?? `Cliente #${sale.customerId ?? "N/A"}`,
              amount: formatGs(Number(sale.total) || 0),
              status: status.text,
              statusClass: status.className,
            };
          });
        setRecentSales(normalizedRecentSales);

        const trendValues = buildTrendSeries(sales);
        setChartValues(trendValues);

        const currentSixMonthTotal = trendValues.reduce((sum, value) => sum + value, 0);
        setChartTotal(currentSixMonthTotal);

        const currentPeriod = trendValues.slice(3).reduce((sum, value) => sum + value, 0);
        const previousPeriod = trendValues.slice(0, 3).reduce((sum, value) => sum + value, 0);
        const delta = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : currentPeriod > 0 ? 100 : 0;
        setChartDelta(delta);
      } catch (requestError) {
        console.error("Error cargando dashboard:", requestError);
        setError("No se pudo cargar el dashboard. Verifica la conexion con el backend.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const linePath = buildChartPath(chartValues);
  const areaPath = buildAreaPath(linePath);
  const trendText = `${chartDelta >= 0 ? "+" : ""}${chartDelta.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <Icon name="warning" className="text-base" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid of indicators with scale hover lift */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
        {!stats.length && loading && (
          <div className="col-span-full py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
            Cargando indicadores financieros...
          </div>
        )}
      </section>

      {/* Performance & Recent Sales Section */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Performance Chart with Glow */}
        <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                Rendimiento de Ventas
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Volumen acumulado por mes</p>
            </div>
            <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              Últimos 6 meses
            </span>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {formatGs(chartTotal)}
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                chartDelta >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
              }`}>
                <Icon className="text-xs" name={chartDelta >= 0 ? "trending_up" : "trending_down"} />
                {trendText}
              </span>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">vs 3 meses previos</p>
            </div>
          </div>

          <div className="mt-6 h-[220px] w-full">
            <svg className="h-full w-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1131_5935" x1="236" x2="236" y1="1" y2="149">
                  <stop stopColor="#135bec" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#135bec" stopOpacity="0" />
                </linearGradient>
                {/* Neon Glow Filter */}
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {areaPath ? <path d={areaPath} fill="url(#paint0_linear_1131_5935)" /> : null}
              {linePath ? <path d={linePath} stroke="#135bec" strokeLinecap="round" strokeWidth="3.5" filter="url(#neon-glow)" /> : null}
            </svg>

            <div className="mt-4 flex justify-between px-2">
              {monthLabels.map((month) => (
                <p key={month} className={`text-[10px] font-bold uppercase tracking-wider ${
                  month === monthLabels[monthLabels.length - 1] ? "text-primary" : "text-slate-400 dark:text-slate-600"
                }`}>
                  {month}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales List */}
        <div className="flex w-full flex-col gap-5 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/60 lg:w-[400px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                Últimas Ventas
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monitoreo en tiempo real</p>
            </div>
            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10">
              {recentSales.length}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentSales.map((sale) => (
              <SaleItem key={sale.id} {...sale} />
            ))}
            {!recentSales.length && (
              <div className="py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                {loading ? "Cargando ventas recientes..." : "No hay ventas registradas."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, iconWrap, value, label, onClick }) {
  const isClickable = Boolean(onClick);
  // Extract custom background and text colors to style it like a high-tech badge
  const isEmerald = iconWrap.includes("emerald");
  const isAmber = iconWrap.includes("amber");
  const isBlue = iconWrap.includes("blue");
  const isViolet = iconWrap.includes("violet");

  let badgeClass = "bg-primary/10 text-primary";
  if (isEmerald) badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10";
  if (isAmber) badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/10";
  if (isBlue) badgeClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10";
  if (isViolet) badgeClass = "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/10";

  return isClickable ? (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/60 lg:p-6 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer text-left"
    >
      <div className={`flex size-10 items-center justify-center rounded-xl ${badgeClass}`}>
        <Icon name={icon} className="text-xl" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white lg:text-xl xl:text-2xl break-words">
          {value}
        </h3>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {label}
        </p>
      </div>
    </button>
  ) : (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/60 lg:p-6 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-default">
      <div className={`flex size-10 items-center justify-center rounded-xl ${badgeClass}`}>
        <Icon name={icon} className="text-xl" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white lg:text-xl xl:text-2xl break-words">
          {value}
        </h3>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {label}
        </p>
      </div>
    </article>
  );
}

function SaleItem({ icon, title, customer, amount, status, statusClass }) {
  const isToday = status === "Hoy";
  return (
    <article className="flex items-center justify-between py-3.5 transition-all duration-200 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-2 rounded-xl -mx-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/50">
          <Icon className="text-slate-500 dark:text-slate-400 text-lg" name={icon} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-slate-850 dark:text-slate-200 truncate">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{customer}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-sm font-black text-slate-800 dark:text-white">{amount}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${statusClass}`}>
          <span className={`size-1.5 rounded-full ${isToday ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {status}
        </span>
      </div>
    </article>
  );
}
