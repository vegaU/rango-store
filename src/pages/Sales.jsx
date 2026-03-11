import Icon from "../components/Icon";
import { formatGs } from "../utils/currency";

const salesStats = [
  { icon: "point_of_sale", value: formatGs(57540000), label: "Ventas hoy", tone: "bg-emerald-100 text-emerald-700" },
  { icon: "receipt_long", value: "46", label: "Tickets emitidos", tone: "bg-sky-100 text-sky-700" },
  { icon: "pending_actions", value: "12", label: "Pedidos abiertos", tone: "bg-amber-100 text-amber-700" },
  { icon: "monitoring", value: formatGs(1250000), label: "Ticket promedio", tone: "bg-violet-100 text-violet-700" },
];

const funnelSteps = [
  { label: "Cotizaciones", value: 18, amount: formatGs(30800000), color: "bg-sky-500" },
  { label: "Confirmadas", value: 11, amount: formatGs(21860000), color: "bg-emerald-500" },
  { label: "Despacho", value: 6, amount: formatGs(10340000), color: "bg-violet-500" },
  { label: "Pendientes", value: 5, amount: formatGs(6740000), color: "bg-amber-500" },
];

const recentSales = [
  {
    order: "VTA-2048",
    customer: "Taller El Rayo",
    items: "Frenos Brembo, Liquido DOT4",
    seller: "Mariana",
    total: formatGs(2385000),
    payment: "Transferencia",
    status: "Completada",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    order: "VTA-2047",
    customer: "Juan Perez",
    items: "Bateria LTH Pro 650",
    seller: "Diego",
    total: formatGs(1385000),
    payment: "Efectivo",
    status: "Lista para entrega",
    statusClass: "bg-sky-100 text-sky-700",
  },
  {
    order: "VTA-2046",
    customer: "Distribuidora Norte",
    items: "12 Aceites 5W30, 8 filtros",
    seller: "Carla",
    total: formatGs(6310000),
    payment: "Credito",
    status: "Pendiente de cobro",
    statusClass: "bg-amber-100 text-amber-700",
  },
  {
    order: "VTA-2045",
    customer: "Lucia Torres",
    items: "Faros LED H4, fusibles",
    seller: "Mariana",
    total: formatGs(543000),
    payment: "Tarjeta",
    status: "Completada",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    order: "VTA-2044",
    customer: 'Taller "Ruta 2"',
    items: "Amortiguadores Monroe x2",
    seller: "Diego",
    total: formatGs(1089000),
    payment: "Transferencia",
    status: "Despacho",
    statusClass: "bg-violet-100 text-violet-700",
  },
];

const quotes = [
  {
    customer: "ServiFreno Center",
    note: "Kit completo de suspension delantera",
    total: formatGs(3080000),
    probability: "82%",
    icon: "request_quote",
  },
  {
    customer: "Roberto Diaz",
    note: "Cambio de bateria y bornes",
    total: formatGs(1570000),
    probability: "61%",
    icon: "battery_charging_full",
  },
  {
    customer: "Distribuidora Norte",
    note: "Compra mayorista de lubricantes",
    total: formatGs(14550000),
    probability: "74%",
    icon: "oil_barrel",
  },
];

const paymentMix = [
  { label: "Transferencia", percentage: "44%", color: "bg-sky-500" },
  { label: "Efectivo", percentage: "23%", color: "bg-emerald-500" },
  { label: "Tarjeta", percentage: "19%", color: "bg-violet-500" },
  { label: "Credito", percentage: "14%", color: "bg-amber-500" },
];

const topSellers = [
  { name: "Mariana", closed: formatGs(18210000), tickets: 14 },
  { name: "Diego", closed: formatGs(14390000), tickets: 11 },
  { name: "Carla", closed: formatGs(12630000), tickets: 9 },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_#ffffff,_#fff6eb_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a,_#24160d_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Operacion comercial</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Ventas, cobros y cierres visibles en tiempo real.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Vista pensada para mostrador y ventas B2B: tickets del dia, cotizaciones activas, estados de pedido y mezcla
              de pagos en un tablero unico.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {salesStats.map((item) => (
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Centro de ventas</h2>
                <p className="text-sm text-slate-500">Filtra operaciones por cliente, vendedor o metodo de pago.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <Icon className="text-slate-400" name="search" />
                  <input
                    className="w-full border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200 sm:w-52"
                    placeholder="Buscar venta o cliente"
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="text-slate-400" name="calendar_month" />
                  <span>Hoy</span>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400" type="button">
                  <Icon className="text-base" name="add_shopping_cart" />
                  Nueva venta
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-4">
              {funnelSteps.map((step) => (
                <FunnelCard key={step.label} {...step} />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ventas recientes</h2>
                <p className="text-sm text-slate-500">Seguimiento rapido del estado comercial y operativo.</p>
              </div>

              <button className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600" type="button">
                Ver historial completo
                <Icon className="text-base" name="east" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4 font-semibold">Orden</th>
                    <th className="px-5 py-4 font-semibold">Cliente</th>
                    <th className="px-5 py-4 font-semibold">Items</th>
                    <th className="px-5 py-4 font-semibold">Vendedor</th>
                    <th className="px-5 py-4 font-semibold">Total</th>
                    <th className="px-5 py-4 font-semibold">Pago</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.order} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">{sale.order}</span>
                          <span className="text-xs text-slate-500">Ticket emitido</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">{sale.customer}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{sale.items}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{sale.seller}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{sale.total}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{sale.payment}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${sale.statusClass}`}>
                          {sale.status}
                        </span>
                      </td>
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
                <p className="text-xs uppercase tracking-[0.22em] text-orange-300">Cotizaciones</p>
                <h2 className="mt-2 text-xl font-bold">Probables cierres</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="query_stats" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {quotes.map((quote) => (
                <div key={quote.customer + quote.note} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-white/10 text-orange-200">
                      <Icon className="text-base" name={quote.icon} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{quote.customer}</p>
                        <span className="text-xs font-bold text-orange-300">{quote.probability}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{quote.note}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{quote.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" type="button">
              Revisar pipeline
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mezcla de pagos</h2>
              <Icon className="text-slate-400" name="credit_card" />
            </div>

            <div className="mt-5 space-y-4">
              {paymentMix.map((item) => (
                <ProgressRow key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top vendedores</h2>
              <Icon className="text-slate-400" name="emoji_events" />
            </div>

            <div className="mt-5 space-y-3">
              {topSellers.map((seller) => (
                <div key={seller.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{seller.name}</p>
                    <p className="text-xs text-slate-500">{seller.tickets} tickets cerrados</p>
                  </div>
                  <p className="text-sm font-bold text-orange-600">{seller.closed}</p>
                </div>
              ))}
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

function FunnelCard({ label, value, amount, color }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      </div>
      <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{amount}</p>
    </article>
  );
}

function ProgressRow({ label, percentage, color }) {
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
