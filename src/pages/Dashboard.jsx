import { useEffect, useState } from "react";
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
        const lowStock = products.filter((product) => (Number(product.stock) || 0) <= 3).length;
        const pendingOrders = 0;
        const newCustomers = customers.filter((customer) => {
          const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
          return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart;
        }).length;

        setStats([
          { icon: "payments", iconWrap: "bg-emerald-100 text-emerald-600", value: formatGs(salesToday), label: "Ventas hoy" },
          { icon: "warning", iconWrap: "bg-amber-100 text-amber-600", value: `${lowStock} Articulos`, label: "Bajos en stock" },
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
    <>
      {error && <p className="mb-4 text-sm font-medium text-amber-700 dark:text-amber-300">{error}</p>}

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
        {!stats.length && loading && (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">Cargando indicadores...</p>
        )}
      </section>

      <section className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Rendimiento de ventas</h2>
            <span className="text-sm font-bold text-primary">Ultimos 6 meses</span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-3xl font-extrabold tracking-tight">{formatGs(chartTotal)}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${chartDelta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                <Icon className="text-xs" name={chartDelta >= 0 ? "trending_up" : "trending_down"} /> {trendText}
              </span>
              <p className="text-xs font-medium text-slate-500">vs 3 meses previos</p>
            </div>
          </div>

          <div className="mt-4 h-[220px] w-full">
            <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150" xmlns="http://www.w3.org/2000/svg">
              {areaPath ? <path d={areaPath} fill="url(#paint0_linear_1131_5935)" /> : null}
              {linePath ? <path d={linePath} stroke="#135bec" strokeLinecap="round" strokeWidth="3" /> : null}
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1131_5935" x1="236" x2="236" y1="1" y2="149">
                  <stop stopColor="#135bec" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#135bec" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="mt-4 flex justify-between px-2">
              {monthLabels.map((month) => (
                <p key={month} className={`text-[11px] font-bold ${month === monthLabels[monthLabels.length - 1] ? "text-primary" : "text-slate-500"}`}>
                  {month}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Ultimas ventas</h2>
            <span className="text-sm font-bold text-primary">{recentSales.length}</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <SaleItem key={sale.id} {...sale} />
            ))}
            {!recentSales.length && (
              <p className="py-4 text-sm text-slate-500 dark:text-slate-400">{loading ? "Cargando ventas..." : "No hay ventas registradas."}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ icon, iconWrap, value, label }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-6">
      <div className={`flex size-10 items-center justify-center rounded-lg ${iconWrap}`}>
        <Icon name={icon} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold leading-tight">{value}</h3>
        <p className="text-xs font-medium text-slate-500 lg:text-sm">{label}</p>
      </div>
    </article>
  );
}

function SaleItem({ icon, title, customer, amount, status, statusClass }) {
  return (
    <article className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="text-slate-600 dark:text-slate-400" name={icon} />
        </div>
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-slate-500">{customer}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{amount}</p>
        <p className={`text-[10px] font-bold ${statusClass}`}>{status}</p>
      </div>
    </article>
  );
}
