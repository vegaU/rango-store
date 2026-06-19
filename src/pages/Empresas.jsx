import { useCallback, useEffect, useState } from "react";
import Icon from "../components/Icon";
import { get, patch, post, put } from "../lib/api";

export default function Empresas() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create modal state
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editTenant, setEditTenant] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get("/tenants");
      setTenants(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleToggleStatus = async (tenant) => {
    setUpdatingId(tenant.id);
    setError("");
    setSuccess("");

    try {
      const newStatus = !tenant.isActive;
      await patch(`/tenants/${tenant.id}/status`, { isActive: newStatus });
      setSuccess(
        `Empresa "${tenant.name}" ${newStatus ? "activada" : "desactivada"} exitosamente`,
      );
      loadTenants();
    } catch {
      setError("Error al cambiar el estado de la empresa");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSlugChange = (value) => {
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generated);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!companyName || !slug || !adminName || !adminEmail || !adminPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (adminPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSubmitting(true);

    try {
      await post("/tenants/register", {
        companyName: companyName.trim(),
        slug: slug.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      setSuccess(`Empresa "${companyName}" creada exitosamente`);
      setShowModal(false);
      resetForm();
      loadTenants();
    } catch (err) {
      setError(err.message || "Error al crear la empresa");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompanyName("");
    setSlug("");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
  };

  const openEditModal = (tenant) => {
    setEditTenant(tenant);
    setEditName(tenant.name);
    setEditSlug(tenant.slug);
    setError("");
    setSuccess("");
  };

  const handleEditCompany = async (e) => {
    e.preventDefault();
    if (!editTenant) return;
    setError("");
    setSuccess("");

    if (!editName.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    setEditSubmitting(true);
    try {
      await put(`/tenants/${editTenant.id}`, {
        name: editName.trim(),
        slug: editSlug.trim(),
      });
      setSuccess(`Empresa "${editName}" actualizada exitosamente`);
      setEditTenant(null);
      loadTenants();
    } catch (err) {
      setError(err.message || "Error al actualizar la empresa");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Empresas
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Gestiona todas las empresas registradas en la plataforma
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
        >
          <Icon name="add" className="text-lg" />
          Nueva Empresa
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          <Icon name="error" className="text-base" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <Icon name="check_circle" className="text-base" />
          <p>{success}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Cargando empresas...
          </span>
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon name="domain" className="text-5xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            No hay empresas registradas
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    ID
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Nombre
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Slug
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Creado
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-800 dark:text-white">
                      {tenant.id}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                      {tenant.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {tenant.slug}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          tenant.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tenant.isActive
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {tenant.isActive ? "Activa" : "Suspendida"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(tenant.createdAt).toLocaleDateString("es-PY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(tenant)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          title="Editar empresa"
                        >
                          <Icon name="edit" className="text-sm" />
                          Editar
                        </button>
                        {/* Toggle status button */}
                        <button
                          disabled={updatingId === tenant.id}
                          onClick={() => handleToggleStatus(tenant)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                            tenant.isActive
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          }`}
                        >
                          {updatingId === tenant.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Icon
                              name={tenant.isActive ? "block" : "check_circle"}
                              className="text-sm"
                            />
                          )}
                          {tenant.isActive ? "Suspender" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to Create Company */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl sm:p-10">
            {/* Close button */}
            <button
              onClick={() => { setShowModal(false); resetForm(); }}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Icon name="close" className="text-xl" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 ring-4 ring-primary/10">
                <Icon name="store" className="text-2xl" />
              </div>
              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Nueva Empresa
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Crea una nueva empresa con su administrador
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleCreateCompany}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nombre de la Empresa
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    handleSlugChange(e.target.value);
                  }}
                  placeholder="Mi Tienda"
                  type="text"
                  value={companyName}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Slug
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="mi-tienda"
                  type="text"
                  value={slug}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nombre del Administrador
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Juan Pérez"
                  type="text"
                  value={adminName}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email del Administrador
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@mitienda.com"
                  type="email"
                  value={adminEmail}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Contraseña del Administrador
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  type="password"
                  value={adminPassword}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creando...
                    </span>
                  ) : (
                    "Crear Empresa"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setEditTenant(null)}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Icon name="close" className="text-xl" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
                <Icon name="edit" className="text-2xl" />
              </div>
              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Editar Empresa
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Modifica el nombre o el slug
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleEditCompany}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nombre de la Empresa
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Mi Tienda"
                  type="text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Slug
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="mi-tienda"
                  type="text"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTenant(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {editSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </span>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}