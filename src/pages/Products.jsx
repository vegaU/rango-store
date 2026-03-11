import Icon from "../components/Icon";
import { formatGs } from "../utils/currency";

const inventoryStats = [
  {
    icon: "inventory_2",
    value: "1,284",
    label: "Productos activos",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    icon: "warning",
    value: "37",
    label: "Stock critico",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    icon: "local_shipping",
    value: "14",
    label: "Por recibir",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: "sell",
    value: formatGs(135200000),
    label: "Valor en rotacion",
    tone: "bg-emerald-100 text-emerald-700",
  },
];

const spotlightProducts = [
  {
    name: "Kit Frenos Brembo Street",
    sku: "BRM-2201",
    category: "Frenos",
    price: formatGs(1060000),
    stock: 8,
    location: "A1-04",
    trend: "+12%",
    tone: "from-rose-500/15 via-white to-white",
    icon: "disc_full",
  },
  {
    name: "Aceite Sintetico Mobil 5W30",
    sku: "OIL-530X",
    category: "Lubricantes",
    price: formatGs(312000),
    stock: 24,
    location: "B3-12",
    trend: "+7%",
    tone: "from-amber-500/15 via-white to-white",
    icon: "oil_barrel",
  },
  {
    name: "Bateria LTH Pro 650",
    sku: "BAT-650L",
    category: "Electricidad",
    price: formatGs(1385000),
    stock: 5,
    location: "C2-03",
    trend: "-3%",
    tone: "from-cyan-500/15 via-white to-white",
    icon: "battery_charging_full",
  },
];

const tableProducts = [
  {
    name: "Filtro de Aire K&N",
    sku: "AIR-992K",
    category: "Admision",
    brand: "K&N",
    stock: 12,
    status: "Estable",
    statusClass: "bg-emerald-100 text-emerald-700",
    price: formatGs(219000),
  },
  {
    name: "Pastillas Bosch QuietCast",
    sku: "BSC-144A",
    category: "Frenos",
    brand: "Bosch",
    stock: 4,
    status: "Reponer",
    statusClass: "bg-amber-100 text-amber-700",
    price: formatGs(425000),
  },
  {
    name: "Amortiguador Monroe Gas",
    sku: "MNR-88G",
    category: "Suspension",
    brand: "Monroe",
    stock: 16,
    status: "Estable",
    statusClass: "bg-emerald-100 text-emerald-700",
    price: formatGs(543000),
  },
  {
    name: "Bujia NGK Iridium IX",
    sku: "NGK-IX7",
    category: "Encendido",
    brand: "NGK",
    stock: 3,
    status: "Critico",
    statusClass: "bg-rose-100 text-rose-700",
    price: formatGs(135000),
  },
  {
    name: "Sensor MAF Denso",
    sku: "DNS-401M",
    category: "Sensores",
    brand: "Denso",
    stock: 9,
    status: "Estable",
    statusClass: "bg-emerald-100 text-emerald-700",
    price: formatGs(702000),
  },
];

const purchaseAlerts = [
  { title: "Bujias NGK Iridium IX", note: "3 unidades disponibles", icon: "priority_high" },
  { title: "Pastillas Bosch QuietCast", note: "Cobertura estimada para 4 dias", icon: "schedule" },
  { title: "Bateria LTH Pro 650", note: "Ultimo ingreso hace 18 dias", icon: "inventory" },
];

export default function Products() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(19,91,236,0.14),_transparent_30%),linear-gradient(135deg,_#ffffff,_#eef4ff_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(19,91,236,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a,_#0f1c37_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Inventario central</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Productos listos para vender, reponer y rotar.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Vista pensada para una refaccionaria: prioridad de stock, ubicacion en bodega, categorias tecnicas y alertas
              de compra en el mismo panel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {inventoryStats.map((item) => (
              <StatPill key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catalogo destacado</h2>
                <p className="text-sm text-slate-500">Seleccion de productos con mejor salida esta semana.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <Icon className="text-slate-400" name="search" />
                  <input
                    className="w-full border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200 sm:w-52"
                    placeholder="Buscar por SKU o nombre"
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="text-slate-400" name="tune" />
                  <span>Categoria: Todas</span>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" type="button">
                  <Icon className="text-base" name="add" />
                  Nuevo producto
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {spotlightProducts.map((product) => (
                <SpotlightCard key={product.sku} {...product} />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inventario por producto</h2>
                <p className="text-sm text-slate-500">Control rapido de stock, marca y estado de reposicion.</p>
              </div>

              <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary" type="button">
                Exportar listado
                <Icon className="text-base" name="download" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4 font-semibold">Producto</th>
                    <th className="px-5 py-4 font-semibold">Categoria</th>
                    <th className="px-5 py-4 font-semibold">Marca</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                    <th className="px-5 py-4 font-semibold">Precio</th>
                  </tr>
                </thead>

                <tbody>
                  {tableProducts.map((product) => (
                    <tr key={product.sku} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">{product.name}</span>
                          <span className="text-xs text-slate-500">{product.sku}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{product.category}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{product.brand}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.statusClass}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{product.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Reposicion</p>
                <h2 className="mt-2 text-xl font-bold">Compra sugerida</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="shopping_bag" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {purchaseAlerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                      <Icon className="text-base" name={alert.icon} />
                    </div>
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{alert.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" type="button">
              Generar orden de compra
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mapa de categorias</h2>
              <Icon className="text-slate-400" name="category" />
            </div>

            <div className="mt-5 space-y-4">
              <CategoryRow label="Frenos" percentage="32%" color="bg-rose-500" />
              <CategoryRow label="Lubricantes" percentage="24%" color="bg-amber-500" />
              <CategoryRow label="Electricidad" percentage="19%" color="bg-cyan-500" />
              <CategoryRow label="Suspension" percentage="15%" color="bg-violet-500" />
              <CategoryRow label="Sensores" percentage="10%" color="bg-emerald-500" />
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
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">{label}</p>
    </article>
  );
}

function SpotlightCard({ name, sku, category, price, stock, location, trend, tone, icon }) {
  return (
    <article className={`rounded-[24px] border border-slate-200 bg-gradient-to-br ${tone} p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon name={icon} />
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-lg font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{sku}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoChip icon="category" label={category} />
        <InfoChip icon="warehouse" label={location} />
        <InfoChip icon="inventory_2" label={`${stock} uds`} />
        <InfoChip icon="attach_money" label={price} />
      </div>
    </article>
  );
}

function InfoChip({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
      <Icon className="text-base text-slate-400" name={icon} />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

function CategoryRow({ label, percentage, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500">{percentage}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: percentage }} />
      </div>
    </div>
  );
}
