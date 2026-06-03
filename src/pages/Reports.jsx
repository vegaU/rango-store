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
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
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

        setMonthlySeries(buildMonthlySeries(sales));
        setTopCategories(buildTopCategories(products, categories));
        setTopCustomers(buildTopCustomers(sales, customers));
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
      <section className="grid gap-6">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ventas por mes</h2>
                <p className="text-sm text-slate-500">Acumulado mensual de los ultimos 6 meses.</p>
              </div>
              <Icon className="text-slate-400" name="show_chart" />
            </div>
            {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

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
      </section>
    </div>
  );
}

