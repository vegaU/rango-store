import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post, put } from "../lib/api";

function buildStats(categories, products) {
  return [
    { icon: "category", value: categories.length.toString(), label: "Categorias activas", tone: "bg-sky-100 text-sky-700" },
    { icon: "inventory_2", value: products.length.toString(), label: "Productos", tone: "bg-violet-100 text-violet-700" },
    { icon: "trending_up", value: "0%", label: "Cambio semanal", tone: "bg-amber-100 text-amber-700" },
    { icon: "shopping_bag", value: "0", label: "Ventas totales", tone: "bg-emerald-100 text-emerald-700" },
  ];
}

const categoryFields = [
  { name: "name", label: "Nombre de la categoria", placeholder: "Ej: Repuestos motores", required: true },
  { name: "description", label: "Descripcion", placeholder: "Ej: Piezas de motores y accesorios asociados", type: "textarea" },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function syncCategoryViews(nextCategories, nextProducts) {
    setCategories(nextCategories);
    setProducts(nextProducts);
    setStats(buildStats(nextCategories, nextProducts));
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryRows, productRows] = await Promise.all([get("/categories"), get("/products")]);
        const safeCategories = Array.isArray(categoryRows) ? categoryRows : [];
        const safeProducts = Array.isArray(productRows) ? productRows : [];

        syncCategoryViews(safeCategories, safeProducts);
      } catch (requestError) {
        console.error("Error cargando categorias:", requestError);
        setError("No se pudieron cargar las categorias. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getProductCountByCategory(categoryId) {
    return products.filter((product) => product.categoryId === categoryId).length;
  }

  function openCreateModal() {
    setEditingCategory(null);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSubmitError("");
  }

  async function handleSaveCategory(formData) {
    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      name: formData.name,
      description: formData.description,
    };

    try {
      let savedCategory;

      if (editingCategory) {
        savedCategory = await put(`/categories/${editingCategory.id}`, payload);
      } else {
        savedCategory = await post("/categories", payload);
      }

      const updatedCategories = editingCategory
        ? categories.map((category) => (category.id === editingCategory.id ? savedCategory : category))
        : [savedCategory, ...categories];

      syncCategoryViews(updatedCategories, products);
      closeModal();
    } catch (requestError) {
      console.error("Error guardando categoria:", requestError);
      setSubmitError("No se pudo guardar la categoria. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) {
      return;
    }

    setIsDeleting(true);

    try {
      await del(`/categories/${selectedCategory.id}`);
      const updatedCategories = categories.filter((category) => category.id !== selectedCategory.id);
      const updatedProducts = products.map((product) =>
        product.categoryId === selectedCategory.id ? { ...product, categoryId: null } : product,
      );

      syncCategoryViews(updatedCategories, updatedProducts);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (requestError) {
      console.error("Error eliminando categoria:", requestError);
      setError("No se pudo eliminar la categoria. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  const modalInitialValues = editingCategory
    ? {
        name: editingCategory.name,
        description: editingCategory.description || "",
      }
    : {};

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f0f9ff_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(135deg,_#0f172a,_#0d1f2d_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Gestion de inventario</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Categorias ordenadas por productos, ventas y visibilidad.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Organiza los productos en categorias para facilitar busquedas, analisis de ventas y control de inventario.
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Categorias disponibles</h2>
              <p className="text-sm text-slate-500">Administra las categorias de productos en tu almacen.</p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              onClick={openCreateModal}
              type="button"
            >
              <Icon className="text-base" name="add" />
              Nueva categoria
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4 font-semibold">Nombre</th>
                  <th className="px-5 py-4 font-semibold">Descripcion</th>
                  <th className="px-5 py-4 font-semibold">Productos</th>
                  <th className="px-5 py-4 font-semibold">Fecha de creacion</th>
                  <th className="px-5 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{category.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{category.description || "Sin descripcion"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-fit justify-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {getProductCountByCategory(category.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString("es-PY") : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                          onClick={() => openEditModal(category)}
                          type="button"
                        >
                          <Icon className="text-sm" name="edit" />
                          Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDeleteDialogOpen(true);
                          }}
                          type="button"
                        >
                          <Icon className="text-sm" name="delete" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan="5">
                      {loading ? "Cargando categorias..." : "No hay categorias para mostrar. Crea una nueva para comenzar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FormModal
        fields={categoryFields}
        initialValues={modalInitialValues}
        isLoading={isSubmitting}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveCategory}
        submitLabel={editingCategory ? "Guardar cambios" : "Crear categoria"}
        title={editingCategory ? "Editar categoria" : "Nueva categoria"}
      />
      {submitError && <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>}

      <ConfirmDialog
        isDangerous
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={`Estas seguro de que deseas eliminar "${selectedCategory?.name}"? Esta accion no se puede deshacer.`}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Eliminar categoria"
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
