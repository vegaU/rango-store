import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { get } from "../lib/api";
import { formatGs } from "../utils/currency";

function buildMonthlySeries(sales) {
  const now = new Date();
  const series = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const total = sales.reduce((sum, sale) => {
      const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        return sum;
      }

      return createdAt.getMonth() === month && createdAt.getFullYear() === year ? sum + (Number(sale.total) || 0) : sum;
    }, 0);

    series.push({
      label: date.toLocaleDateString("es-PY", { month: "short" }),
      total,
    });
  }

  return series;
}

function buildTopCategories(products, categories) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const total = products.length || 1;
  const counts = products.reduce((accumulator, product) => {
    const label = categoryNames.get(product.categoryId) ?? product.category?.name ?? "Sin categoria";
    accumulator.set(label, (accumulator.get(label) ?? 0) + 1);
    return accumulator;
  }, new Map());

  const colors = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, amount], index) => ({
      label,
      amount,
      percentage: Math.round((amount / total) * 100),
      color: colors[index] ?? "bg-slate-500",
    }));
}

function buildTopCustomers(sales, customers) {
  const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));
  const totals = sales.reduce((accumulator, sale) => {
    const customerId = sale.customerId ?? 0;
    accumulator.set(customerId, (accumulator.get(customerId) ?? 0) + (Number(sale.total) || 0));
    return accumulator;
  }, new Map());

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([customerId, total]) => ({
      id: customerId,
      name: customerNames.get(customerId) ?? `Cliente #${customerId}`,
      total,
    }));
}

export default function Reports() {
  const [stats, setStats] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const [salesData, productsData, customersData, categoriesData] = await Promise.all([
          get("/sales"),
          get("/products"),
          get("/customers"),
          get("/categories"),
        ]);

        const sales = Array.isArray(salesData) ? salesData : [];
        const products = Array.isArray(productsData) ? productsData : [];
        const customers = Array.isArray(customersData) ? customersData : [];
        const categories = Array.isArray(categoriesData) ? categoriesData : [];

        const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
        const inventoryValue = products.reduce((sum, product) => sum + (Number(product.stock) || 0) * (Number(product.price) || 0), 0);
        const avgTicket = sales.length ? totalSales / sales.length : 0;
        const lowStock = products.filter((product) => (Number(product.stock) || 0) <= 3).length;

        setStats([
          { icon: "bar_chart", value: formatGs(totalSales), label: "Ventas acumuladas", tone: "bg-sky-100 text-sky-700" },
          { icon: "sell", value: formatGs(inventoryValue), label: "Valor inventario", tone: "bg-emerald-100 text-emerald-700" },
          { icon: "receipt_long", value: formatGs(avgTicket), label: "Ticket promedio", tone: "bg-amber-100 text-amber-700" },
          { icon: "warning", value: lowStock.toString(), label: "Stock critico", tone: "bg-rose-100 text-rose-700" },
        ]);

        setMonthlySeries(buildMonthlySeries(sales));
        setTopCategories(buildTopCategories(products, categories));
        setTopCustomers(buildTopCustomers(sales, customers));
        setLowStockProducts(
          [...products]
            .filter((product) => (Number(product.stock) || 0) <= 5)
            .sort((left, right) => (Number(left.stock) || 0) - (Number(right.stock) || 0))
            .slice(0, 5),
        );
      } catch (requestError) {
        console.error("Error cargando reportes:", requestError);
        setError("No se pudieron cargar los reportes. Verifica la conexion con el backend.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#ffffff,_#f0f9ff_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a,_#102132_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Inteligencia comercial</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Reportes construidos con datos reales del negocio.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Resumen de ventas, clientes, inventario y categorias usando la informacion actual de la base de datos.
            </p>
            {error && <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {stats.map((item) => (
              <StatPill key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ventas por mes</h2>
                <p className="text-sm text-slate-500">Acumulado mensual de los ultimos 6 meses.</p>
              </div>
              <Icon className="text-slate-400" name="show_chart" />
            </div>

            <div className="mt-6 space-y-4">
              {monthlySeries.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                    <span className="text-slate-500">{formatGs(item.total)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-sky-500"
                      style={{
                        width: `${Math.max(
                          6,
                          Math.round(
                            (item.total / Math.max(...monthlySeries.map((seriesItem) => seriesItem.total), 1)) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {!monthlySeries.length && <p className="text-sm text-slate-500 dark:text-slate-400">{loading ? "Cargando datos..." : "Sin ventas para reportar."}</p>}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Categorias mas activas</h2>
                <Icon className="text-slate-400" name="category" />
              </div>

              <div className="mt-5 space-y-4">
                {topCategories.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="text-slate-500">{item.amount} productos</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
                {!topCategories.length && <p className="text-sm text-slate-500 dark:text-slate-400">{loading ? "Cargando datos..." : "Sin categorias para reportar."}</p>}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clientes top</h2>
                <Icon className="text-slate-400" name="emoji_events" />
              </div>

              <div className="mt-5 space-y-3">
                {topCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-slate-500">Acumulado en ventas</p>
                    </div>
                    <p className="text-sm font-bold text-sky-600">{formatGs(customer.total)}</p>
                  </div>
                ))}
                {!topCustomers.length && <p className="text-sm text-slate-500 dark:text-slate-400">{loading ? "Cargando datos..." : "Sin clientes con ventas."}</p>}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Alertas</p>
                <h2 className="mt-2 text-xl font-bold">Productos sensibles</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="inventory_2" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{Number(product.stock) || 0} unidades disponibles</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-sky-200">
                      {formatGs(Number(product.price) || 0)}
                    </span>
                  </div>
                </div>
              ))}
              {!lowStockProducts.length && <p className="text-sm text-slate-300">{loading ? "Cargando datos..." : "Sin productos criticos."}</p>}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function StatPill({ icon, value, label, tone }) {
  return (
    <article className="rounded-2xl border border-white/60 bg-white/75 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className={`mb-3 flex size-10 items-center justify-center rounded-2xl ${tone}`}>
        <Icon name={icon} />
      </div>
      <p className="break-words text-base font-black leading-tight text-slate-900 dark:text-white sm:text-xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">{label}</p>
    </article>
  );
}
