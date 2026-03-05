import Icon from "../components/Icon";

const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

const stats = [
  { icon: "payments", iconWrap: "bg-emerald-100 text-emerald-600", value: "$1,250.00", label: "Ventas hoy" },
  { icon: "warning", iconWrap: "bg-amber-100 text-amber-600", value: "12 Articulos", label: "Bajos en stock" },
  { icon: "assignment_late", iconWrap: "bg-blue-100 text-blue-600", value: "8 Pedidos", label: "Pendientes" },
  { icon: "person_add", iconWrap: "bg-violet-100 text-violet-600", value: "15 Nuevos", label: "Clientes" },
];

const sales = [
  { icon: "directions_car", title: "Frenos Brembo Z2", customer: "Carlos Mendez", amount: "$145.00", status: "Completado", statusClass: "text-emerald-600" },
  { icon: "oil_barrel", title: "Aceite Sintetico 5W30", customer: "Lucia Torres", amount: "$42.50", status: "Completado", statusClass: "text-emerald-600" },
  { icon: "battery_charging_full", title: "Bateria LTH Pro", customer: "Juan Perez", amount: "$189.99", status: "Pendiente", statusClass: "text-amber-500" },
  { icon: "tire_repair", title: "Llantas Michelin R17", customer: 'Taller "El Rayo"', amount: "$560.00", status: "Completado", statusClass: "text-emerald-600" },
  { icon: "lightbulb", title: "Faros LED H4", customer: "Roberto Diaz", amount: "$35.20", status: "Completado", statusClass: "text-emerald-600" },
];

export default function Dashboard() {
  return (
    <>
      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Rendimiento de Ventas</h2>
            <button className="flex items-center gap-1 text-sm font-bold text-primary" type="button">
              Detalles <Icon name="chevron_right" className="text-sm" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-3xl font-extrabold tracking-tight">$45,200.00</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                <Icon name="trending_up" className="text-xs" /> +12.5%
              </span>
              <p className="text-xs font-medium text-slate-500">vs ultimos 6 meses</p>
            </div>
          </div>

          <div className="mt-4 h-[220px] w-full">
            <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z"
                fill="url(#paint0_linear_1131_5935)"
              />
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                stroke="#135bec"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1131_5935" x1="236" x2="236" y1="1" y2="149">
                  <stop stopColor="#135bec" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#135bec" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="mt-4 flex justify-between px-2">
              {monthLabels.map((month) => (
                <p key={month} className={`text-[11px] font-bold ${month === "Jun" ? "text-primary" : "text-slate-500"}`}>
                  {month}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Ultimas Ventas</h2>
            <button className="text-sm font-bold text-primary" type="button">
              Ver todas
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {sales.map((sale) => (
              <SaleItem key={`${sale.title}-${sale.customer}`} {...sale} />
            ))}
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
