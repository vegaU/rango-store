import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import FormModal from "../components/FormModal";
import Icon from "../components/Icon";
import { getAuthUser } from "../lib/auth";
import { get, post, put } from "../lib/api";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "cajero", label: "Cajero" },
];

function buildUserStats(users) {
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;
  const admins = users.filter((user) => user.role === "admin").length;
  const cashiers = users.filter((user) => user.role === "cajero").length;

  return [
    { icon: "groups", value: users.length.toString(), label: "Usuarios", tone: "bg-sky-100 text-sky-700" },
    { icon: "verified_user", value: activeUsers.toString(), label: "Activos", tone: "bg-emerald-100 text-emerald-700" },
    { icon: "admin_panel_settings", value: admins.toString(), label: "Admins", tone: "bg-violet-100 text-violet-700" },
    { icon: "point_of_sale", value: cashiers.toString(), label: "Cajeros", tone: "bg-amber-100 text-amber-700" },
    { icon: "person_off", value: inactiveUsers.toString(), label: "Inactivos", tone: "bg-rose-100 text-rose-700" },
  ];
}

export default function Settings() {
  const authUser = getAuthUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const stats = useMemo(() => buildUserStats(users), [users]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const usersData = await get("/users");
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (requestError) {
        console.error("Error cargando usuarios:", requestError);
        setError("No se pudieron cargar los usuarios. Verifica tu sesion o la conexion con el backend.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function upsertUser(nextUser) {
    setUsers((currentUsers) => {
      const exists = currentUsers.some((user) => user.id === nextUser.id);
      return exists
        ? currentUsers.map((user) => (user.id === nextUser.id ? nextUser : user))
        : [nextUser, ...currentUsers];
    });
  }

  async function handleCreateUser(formData) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const newUser = await post("/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      upsertUser(newUser);
      setIsCreateOpen(false);
    } catch (requestError) {
      console.error("Error creando usuario:", requestError);
      setSubmitError("No se pudo crear el usuario. Verifica el email y la contrasena.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditUser(formData) {
    if (!selectedUser) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const updatedUser = await put(`/users/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive === "true",
      });

      upsertUser(updatedUser);
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (requestError) {
      console.error("Error actualizando usuario:", requestError);
      setSubmitError("No se pudo actualizar el usuario. Verifica los datos ingresados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdatePassword(formData) {
    if (!selectedUser) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const updatedUser = await put(`/users/${selectedUser.id}/password`, {
        password: formData.password,
      });

      upsertUser(updatedUser);
      setIsPasswordOpen(false);
      setSelectedUser(null);
    } catch (requestError) {
      console.error("Error actualizando contrasena:", requestError);
      setSubmitError("No se pudo actualizar la contrasena.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus() {
    if (!selectedUser) {
      return;
    }

    setIsStatusUpdating(true);
    setSubmitError("");

    try {
      const updatedUser = await put(`/users/${selectedUser.id}`, {
        isActive: !selectedUser.isActive,
      });

      upsertUser(updatedUser);
      setIsStatusDialogOpen(false);
      setSelectedUser(null);
    } catch (requestError) {
      console.error("Error cambiando estado del usuario:", requestError);
      setSubmitError("No se pudo actualizar el estado del usuario.");
    } finally {
      setIsStatusUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f5f3ff_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_28%),linear-gradient(135deg,_#0f172a,_#18122b_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Seguridad operativa</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Usuarios, roles y acceso centralizados en un solo panel.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Administra cuentas internas, define que usuarios son administradores o cajeros y controla quienes pueden entrar al sistema.
            </p>
            {error && <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            {stats.map((item) => (
              <StatPill key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Equipo del sistema</h2>
              <p className="text-sm text-slate-500">Cuentas con acceso al dashboard, ventas e inventario.</p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              onClick={() => {
                setSubmitError("");
                setIsCreateOpen(true);
              }}
              type="button"
            >
              <Icon className="text-base" name="person_add" />
              Nuevo usuario
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4 font-semibold">Usuario</th>
                  <th className="px-5 py-4 font-semibold">Rol</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Alta</th>
                  <th className="px-5 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isSelf = authUser?.id === user.id;

                  return (
                    <tr key={user.id} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                          {user.role === "admin" ? "Administrador" : "Cajero"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-PY") : "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            onClick={() => {
                              setSubmitError("");
                              setSelectedUser(user);
                              setIsEditOpen(true);
                            }}
                            type="button"
                          >
                            <Icon className="text-sm" name="edit" />
                            Editar
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                            onClick={() => {
                              setSubmitError("");
                              setSelectedUser(user);
                              setIsPasswordOpen(true);
                            }}
                            type="button"
                          >
                            <Icon className="text-sm" name="password" />
                            Clave
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-900/30 dark:text-rose-300"
                            disabled={isSelf}
                            onClick={() => {
                              setSubmitError("");
                              setSelectedUser(user);
                              setIsStatusDialogOpen(true);
                            }}
                            type="button"
                          >
                            <Icon className="text-sm" name={user.isActive ? "person_off" : "person"} />
                            {user.isActive ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan="5">
                      {loading ? "Cargando usuarios..." : "No hay usuarios cargados todavia."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-violet-300">Sesion actual</p>
                <h2 className="mt-2 text-xl font-bold">{authUser?.name ?? "Administrador"}</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="shield_person" />
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Email</p>
                <p className="mt-1 font-semibold">{authUser?.email ?? "Sin email"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Rol</p>
                <p className="mt-1 font-semibold">{authUser?.role === "admin" ? "Administrador" : "Cajero"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Roles disponibles</h2>
                <p className="text-sm text-slate-500">Perfil operativo actual del sistema.</p>
              </div>
              <Icon className="text-slate-400" name="admin_panel_settings" />
            </div>

            <div className="mt-5 space-y-4">
              <RoleCard
                description="Control total sobre ajustes, reportes, categorias, productos y usuarios."
                icon="manage_accounts"
                title="Administrador"
              />
              <RoleCard
                description="Acceso a ventas, clientes, dashboard e inventario sin permisos de configuracion critica."
                icon="point_of_sale"
                title="Cajero"
              />
            </div>
          </div>
        </aside>
      </section>

      {submitError && <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>}

      <FormModal
        fields={[
          { name: "name", label: "Nombre", placeholder: "Ej: Maria Gomez", required: true },
          { name: "email", label: "Email", placeholder: "maria@rango.store", type: "email", required: true },
          { name: "password", label: "Contrasena", placeholder: "Minimo una clave segura", type: "password", required: true },
          { name: "role", label: "Rol", type: "select", required: true, defaultValue: "cajero", options: roleOptions },
        ]}
        isLoading={isSubmitting}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
        submitLabel="Crear usuario"
        title="Nuevo usuario"
      />

      <FormModal
        fields={[
          { name: "name", label: "Nombre", placeholder: "Ej: Maria Gomez", required: true },
          { name: "email", label: "Email", placeholder: "maria@rango.store", type: "email", required: true },
          { name: "role", label: "Rol", type: "select", required: true, options: roleOptions },
          {
            name: "isActive",
            label: "Estado",
            type: "select",
            required: true,
            options: [
              { value: "true", label: "Activo" },
              { value: "false", label: "Inactivo" },
            ],
          },
        ]}
        initialValues={
          selectedUser
            ? {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                isActive: String(selectedUser.isActive),
              }
            : {}
        }
        isLoading={isSubmitting}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        submitLabel="Guardar cambios"
        title="Editar usuario"
      />

      <FormModal
        fields={[
          { name: "password", label: "Nueva contrasena", placeholder: "Ingresa la nueva clave", type: "password", required: true },
        ]}
        isLoading={isSubmitting}
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdatePassword}
        submitLabel="Actualizar clave"
        title={`Cambiar contrasena${selectedUser ? `: ${selectedUser.name}` : ""}`}
      />

      <ConfirmDialog
        isDangerous={selectedUser?.isActive}
        isLoading={isStatusUpdating}
        isOpen={isStatusDialogOpen}
        message={
          selectedUser?.isActive
            ? `Se desactivara el acceso de "${selectedUser?.name}". El usuario no podra iniciar sesion.`
            : `Se reactivara el acceso de "${selectedUser?.name}" para que pueda volver a iniciar sesion.`
        }
        onCancel={() => {
          setIsStatusDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleToggleStatus}
        title={selectedUser?.isActive ? "Desactivar usuario" : "Activar usuario"}
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

function RoleCard({ title, description, icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          <Icon name={icon} />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}
