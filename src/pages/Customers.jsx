import Icon from "../components/Icon";
import { formatGs } from "../utils/currency";

const customerStats = [
  {
    icon: "groups",
    value: "842",
    label: "Clientes activos",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    icon: "workspace_premium",
    value: "126",
    label: "Mayoristas VIP",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: "schedule",
    value: "59",
    label: "Seguimiento hoy",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    icon: "payments",
    value: formatGs(241500000),
    label: "Facturacion mensual",
    tone: "bg-emerald-100 text-emerald-700",
  },
];

const featuredCustomers = [
  {
    name: "Taller El Rayo",
    type: "Mayorista",
    code: "CLI-018",
    city: "Asuncion",
    balance: formatGs(45500000),
    lastOrder: "Hace 2 dias",
    health: "Alta actividad",
    tone: "from-cyan-500/15 via-white to-white",
    icon: "garage",
  },
  {
    name: "Lucia Torres",
    type: "Retail frecuente",
    code: "CLI-104",
    city: "San Lorenzo",
    balance: formatGs(3520000),
    lastOrder: "Hoy",
    health: "Compra recurrente",
    tone: "from-emerald-500/15 via-white to-white",
    icon: "person",
  },
  {
    name: "Distribuidora Norte",
    type: "Corporativo",
    code: "CLI-007",
    city: "Lambare",
    balance: formatGs(91000000),
    lastOrder: "Hace 5 dias",
    health: "Credito abierto",
    tone: "from-rose-500/15 via-white to-white",
    icon: "apartment",
  },
];

const customerRows = [
  {
    name: "Carlos Mendez",
    segment: "Retail",
    contact: "0981 450 211",
    city: "Fernando de la Mora",
    orders: 18,
    spend: formatGs(14100000),
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    name: 'Taller "Ruta 2"',
    segment: "Mayorista",
    contact: "0982 771 330",
    city: "Capiata",
    orders: 41,
    spend: formatGs(61800000),
    status: "Prioritario",
    statusClass: "bg-sky-100 text-sky-700",
  },
  {
    name: "Roberto Diaz",
    segment: "Retail",
    contact: "0971 889 004",
    city: "Asuncion",
    orders: 7,
    spend: formatGs(2860000),
    status: "Dormido",
    statusClass: "bg-amber-100 text-amber-700",
  },
  {
    name: "ServiFreno Center",
    segment: "Mayorista",
    contact: "0984 551 199",
    city: "Luque",
    orders: 29,
    spend: formatGs(42400000),
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Juan Perez",
    segment: "Retail",
    contact: "0972 663 810",
    city: "San Antonio",
    orders: 11,
    spend: formatGs(6310000),
    status: "Seguimiento",
    statusClass: "bg-violet-100 text-violet-700",
  },
];

const touchpoints = [
  { name: "Taller El Rayo", action: "Llamar por pedido pendiente", at: "10:30", icon: "call" },
  { name: "Roberto Diaz", action: "Enviar promo de frenos", at: "12:00", icon: "campaign" },
  { name: "Distribuidora Norte", action: "Revisar linea de credito", at: "15:45", icon: "account_balance_wallet" },
];

export default function Customers() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f1fff7_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.2),_transparent_28%),linear-gradient(135deg,_#0f172a,_#0d201a_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">CRM comercial</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Clientes ordenados por valor, frecuencia y seguimiento.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Vista pensada para ventas de repuestos: talleres, clientes recurrentes, cuentas mayoristas y acciones de
              fidelizacion en una sola pantalla.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {customerStats.map((item) => (
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clientes destacados</h2>
                <p className="text-sm text-slate-500">Cuentas con mas movimiento o valor estrategico este mes.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <Icon className="text-slate-400" name="search" />
                  <input
                    className="w-full border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200 sm:w-52"
                    placeholder="Buscar cliente o telefono"
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="text-slate-400" name="filter_alt" />
                  <span>Segmento: Todos</span>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500" type="button">
                  <Icon className="text-base" name="person_add" />
                  Nuevo cliente
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {featuredCustomers.map((customer) => (
                <FeaturedCard key={customer.code} {...customer} />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Base de clientes</h2>
                <p className="text-sm text-slate-500">Seguimiento de compras, contacto y estado comercial.</p>
              </div>

              <button className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600" type="button">
                Exportar cartera
                <Icon className="text-base" name="download" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4 font-semibold">Cliente</th>
                    <th className="px-5 py-4 font-semibold">Segmento</th>
                    <th className="px-5 py-4 font-semibold">Contacto</th>
                    <th className="px-5 py-4 font-semibold">Ciudad</th>
                    <th className="px-5 py-4 font-semibold">Pedidos</th>
                    <th className="px-5 py-4 font-semibold">Facturacion</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {customerRows.map((customer) => (
                    <tr key={customer.name} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">{customer.name}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.segment}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.contact}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.city}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {customer.orders}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{customer.spend}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${customer.statusClass}`}>
                          {customer.status}
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
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Agenda comercial</p>
                <h2 className="mt-2 text-xl font-bold">Seguimientos del dia</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="support_agent" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {touchpoints.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
                      <Icon className="text-base" name={item.icon} />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.action}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300">{item.at}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" type="button">
              Ver pipeline comercial
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Segmentacion</h2>
              <Icon className="text-slate-400" name="pie_chart" />
            </div>

            <div className="mt-5 space-y-4">
              <SegmentRow label="Retail frecuente" percentage="38%" color="bg-emerald-500" />
              <SegmentRow label="Mayoristas" percentage="27%" color="bg-sky-500" />
              <SegmentRow label="Talleres aliados" percentage="19%" color="bg-violet-500" />
              <SegmentRow label="Corporativos" percentage="10%" color="bg-amber-500" />
              <SegmentRow label="Dormidos" percentage="6%" color="bg-rose-500" />
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

function FeaturedCard({ name, type, code, city, balance, lastOrder, health, tone, icon }) {
  return (
    <article className={`rounded-[24px] border border-slate-200 bg-gradient-to-br ${tone} p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon name={icon} />
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {type}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-lg font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{code}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoChip icon="location_on" label={city} />
        <InfoChip icon="payments" label={balance} />
        <InfoChip icon="shopping_cart" label={lastOrder} />
        <InfoChip icon="favorite" label={health} />
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

function SegmentRow({ label, percentage, color }) {
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
