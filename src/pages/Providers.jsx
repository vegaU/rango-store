import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post, put } from "../lib/api";
import { isAdmin } from "../lib/permissions";

export default function Providers() {
  const canManageProviders = isAdmin();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load providers on mount
  useEffect(() => {
    async function loadProviders() {
      setLoading(true);
      setError("");
      try {
        const data = await get("/providers");
        const list = Array.isArray(data) ? data : [];
        setProviders(list);
      } catch (e) {
        console.error("Error loading providers:", e);
        setError("No se pudieron cargar los proveedores. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  function openCreateModal() {
    setEditingProvider(null);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(provider) {
    setEditingProvider(provider);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProvider(null);
    setSubmitError("");
  }

  async function handleSaveProvider(formData) {
    setIsSubmitting(true);
    setSubmitError("");
    const payload = {
      name: formData.name,
      contactName: formData.contactName || undefined,
      email: formData.email,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    };
    try {
      let saved;
      if (editingProvider) {
        saved = await put(`/providers/${editingProvider.id}`, payload);
        setProviders((prev) =>
          prev.map((p) => (p.id === editingProvider.id ? saved : p))
        );
      } else {
        saved = await post("/providers", payload);
        setProviders((prev) => [saved, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error("Error saving provider:", e);
      setSubmitError("No se pudo guardar el proveedor. Verifica los datos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProvider() {
    if (!selectedProvider) return;
    setIsDeleting(true);
    try {
      await del(`/providers/${selectedProvider.id}`);
      setProviders((prev) =>
        prev.filter((p) => p.id !== selectedProvider.id)
      );
      setIsDeleteDialogOpen(false);
      setSelectedProvider(null);
    } catch (e) {
      console.error("Error deleting provider:", e);
      setError("No se pudo eliminar el proveedor. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  const modalFields = [
    { name: "name", label: "Nombre", placeholder: "Ej: Proveedor S.A.", required: true },
    { name: "contactName", label: "Contacto", placeholder: "Ej: Juan Pérez" },
    { name: "email", label: "Email", placeholder: "Ej: contacto@proveedor.com", required: true },
    { name: "phone", label: "Teléfono", placeholder: "Ej: 0981 234 567" },
    { name: "address", label: "Dirección", placeholder: "Ej: Av. Siempre Viva 123" },
  ];

  const modalInitialValues = editingProvider
    ? {
        name: editingProvider.name,
        contactName: editingProvider.contactName || "",
        email: editingProvider.email,
        phone: editingProvider.phone || "",
        address: editingProvider.address || "",
      }
    : {};

  return (
    <div className="space-y-6">
      <section className="grid gap-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Proveedores</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Gestión de proveedores y sus datos de contacto.</p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              disabled={!canManageProviders}
              onClick={openCreateModal}
              type="button"
            >
              <Icon className="text-base" name="add" />
              Nuevo proveedor
            </button>
          </div>
          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4">Dirección</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {providers.map((provider) => (
                  <tr key={provider.id} className="premium-row text-sm hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{provider.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{provider.contactName || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{provider.email}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{provider.phone || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{provider.address || "-"}</td>
                    <td className="px-5 py-4 space-x-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                        disabled={!canManageProviders}
                        onClick={() => openEditModal(provider)}
                        type="button"
                      >
                        <Icon className="text-sm" name="edit" />
                        Editar
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                        disabled={!canManageProviders}
                        onClick={() => { setSelectedProvider(provider); setIsDeleteDialogOpen(true); }}
                        type="button"
                      >
                        <Icon className="text-sm" name="delete" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      No hay proveedores registrados. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      Cargando proveedores...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Form Modal */}
      <FormModal
        fields={modalFields}
        initialValues={modalInitialValues}
        isLoading={isSubmitting}
        isOpen={canManageProviders && isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveProvider}
        submitLabel={editingProvider ? "Guardar cambios" : "Crear proveedor"}
        title={editingProvider ? "Editar proveedor" : "Nuevo proveedor"}
      />
      {submitError && (
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isDangerous
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={`¿Estás seguro de que deseas eliminar "${selectedProvider?.name}"? Esta acción no se puede deshacer.`}
        onCancel={() => { setIsDeleteDialogOpen(false); setSelectedProvider(null); }}
        onConfirm={handleDeleteProvider}
        title="Eliminar proveedor"
      />
    </div>
  );
}
