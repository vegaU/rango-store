import { useEffect, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import FormModal from "../components/FormModal";
import Icon from "../components/Icon";
import { getAuthUser } from "../lib/auth";
import { get, post, put } from "../lib/api";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "cajero", label: "Cajero" },
];

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
      <section className="grid gap-6">
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
          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}

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

