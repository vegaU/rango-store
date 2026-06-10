import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post, put } from "../lib/api";
import { isAdmin } from "../lib/permissions";

export default function Customers() {
  const canDeleteCustomers = isAdmin();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  function syncCustomers(nextCustomers, nextSales) {
    setCustomers(nextCustomers);
    setSales(nextSales);
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

  async function handleUpdateCustomer(formData) {
    if (!editCustomer) return;

    setIsEditSubmitting(true);
    setSubmitError("");

    try {
      const updatedCustomer = await put(`/customers/${editCustomer.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      syncCustomers(
        customers.map((c) => (c.id === editCustomer.id ? { ...c, ...updatedCustomer } : c)),
        sales
      );
      setIsEditModalOpen(false);
      setEditCustomer(null);
    } catch (requestError) {
      console.error("Error actualizando cliente:", requestError);
      setSubmitError("No se pudo actualizar el cliente. Verifica si el email ya existe.");
    } finally {
      setIsEditSubmitting(false);
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

      <section className="grid gap-6">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Base de clientes</h2>
              <p className="text-sm text-slate-500">Seguimiento de compras, contacto y estado comercial.</p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}

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
                    <td className="px-5 py-4 space-x-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                        onClick={() => {
                          setEditCustomer(customer);
                          setSubmitError("");
                          setIsEditModalOpen(true);
                        }}
                        type="button"
                      >
                        <Icon className="text-sm" name="edit" />
                        Editar
                      </button>
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
          { name: "email", label: "RUC/CI o Email", placeholder: "Ej: 458741-2 o cliente@example.com", required: true },
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

      {/* Edit Modal */}
      <FormModal
        fields={[
          { name: "name", label: "Nombre del cliente", placeholder: "Ej: Taller El Rayo", required: true },
          { name: "email", label: "RUC/CI o Email", placeholder: "Ej: 458741-2 o cliente@example.com", required: true },
          { name: "phone", label: "Telefono", placeholder: "Ej: 0981 450 211" },
          { name: "address", label: "Direccion", placeholder: "Ej: Fernando de la Mora" },
        ]}
        initialValues={editCustomer ? {
          name: editCustomer.name,
          email: editCustomer.email || "",
          phone: editCustomer.phone || "",
          address: editCustomer.address || "",
        } : undefined}
        isLoading={isEditSubmitting}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditCustomer(null);
        }}
        onSubmit={handleUpdateCustomer}
        submitLabel="Guardar cambios"
        title="Editar cliente"
      />

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

