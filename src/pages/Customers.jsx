import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post } from "../lib/api";
import { isAdmin } from "../lib/permissions";
import { formatGs } from "../utils/currency";

function buildCustomerStats(customers, sales) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const salesThisMonth = sales.filter((sale) => {
    const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
    return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart;
  });

  const monthlyBilling = salesThisMonth.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  const customersWithSales = new Set(sales.map((sale) => sale.customerId).filter(Boolean));
  const followUpToday = 0;

  return [
    { icon: "groups", value: customers.length.toString(), label: "Clientes activos", tone: "bg-sky-100 text-sky-700" },
    { icon: "workspace_premium", value: customersWithSales.size.toString(), label: "Con compras", tone: "bg-violet-100 text-violet-700" },
    { icon: "schedule", value: followUpToday.toString(), label: "Seguimiento hoy", tone: "bg-amber-100 text-amber-700" },
    { icon: "payments", value: formatGs(monthlyBilling), label: "Facturacion mensual", tone: "bg-emerald-100 text-emerald-700" },
  ];
}

export default function Customers() {
  const canDeleteCustomers = isAdmin();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function syncCustomers(nextCustomers, nextSales) {
    setCustomers(nextCustomers);
    setSales(nextSales);
    setStats(buildCustomerStats(nextCustomers, nextSales));
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const customerRows = await get("/customers");
        const safeCustomers = Array.isArray(customerRows) ? customerRows : [];

        let safeSales = [];
        try {
          const salesRows = await get("/sales");
          safeSales = Array.isArray(salesRows) ? salesRows : [];
        } catch (salesError) {
          console.error("Error cargando ventas para metricas de clientes:", salesError);
        }

        syncCustomers(safeCustomers, safeSales);
      } catch (requestError) {
        console.error("Error cargando clientes:", requestError);
        setError("No se pudieron cargar los clientes. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleCreateCustomer(formData) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const newCustomer = await post("/customers", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      syncCustomers([newCustomer, ...customers], sales);
      setIsModalOpen(false);
    } catch (requestError) {
      console.error("Error creando cliente:", requestError);
      setSubmitError("No se pudo guardar el cliente. Verifica si el email ya existe.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCustomer() {
    if (!selectedCustomer) {
      return;
    }

    setIsDeleting(true);

    try {
      await del(`/customers/${selectedCustomer.id}`);
      syncCustomers(customers.filter((customer) => customer.id !== selectedCustomer.id), sales);
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (requestError) {
      console.error("Error eliminando cliente:", requestError);
      setError("No se pudo eliminar el cliente. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

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
              Vista conectada a la base real para revisar clientes, historial comercial y facturacion mensual.
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

      <section className="grid gap-6">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Base de clientes</h2>
              <p className="text-sm text-slate-500">Seguimiento de compras, contacto y estado comercial.</p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              onClick={() => {
                setSubmitError("");
                setIsModalOpen(true);
              }}
              type="button"
            >
              <Icon className="text-base" name="person_add" />
              Nuevo cliente
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4 font-semibold">Cliente</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Telefono</th>
                  <th className="px-5 py-4 font-semibold">Direccion</th>
                  <th className="px-5 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{customer.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.email || "N/A"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.phone || "N/A"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.address || "N/A"}</td>
                    <td className="px-5 py-4">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                        disabled={!canDeleteCustomers}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDeleteDialogOpen(true);
                        }}
                        type="button"
                      >
                        <Icon className="text-sm" name="delete" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan="5">
                      {loading ? "Cargando clientes..." : "No hay clientes para mostrar. Crea uno nuevo para comenzar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FormModal
        fields={[
          { name: "name", label: "Nombre del cliente", placeholder: "Ej: Taller El Rayo", required: true },
          { name: "email", label: "Email", placeholder: "cliente@example.com", type: "email", required: true },
          { name: "phone", label: "Telefono", placeholder: "Ej: 0981 450 211" },
          { name: "address", label: "Direccion", placeholder: "Ej: Fernando de la Mora" },
        ]}
        isLoading={isSubmitting}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCustomer}
        submitLabel="Crear cliente"
        title="Nuevo cliente"
      />
      {submitError && <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>}

      <ConfirmDialog
        isDangerous
        isLoading={isDeleting}
        isOpen={canDeleteCustomers && isDeleteDialogOpen}
        message={`Estas seguro de que deseas eliminar "${selectedCustomer?.name}"? Esta accion no se puede deshacer.`}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleDeleteCustomer}
        title="Eliminar cliente"
      />
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
