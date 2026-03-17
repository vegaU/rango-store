import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post, put } from "../lib/api";
import { isAdmin } from "../lib/permissions";
import { formatGs } from "../utils/currency";

function getCategoryName(row, categories = []) {
  if (row.category?.name) {
    return row.category.name;
  }

  if (row.categoryId) {
    const match = categories.find((category) => category.id === row.categoryId);
    if (match?.name) {
      return match.name;
    }
  }

  return "Sin categoria";
}

function mapProduct(row, categories = []) {
  const stock = Number(row.stock) || 0;
  const priceValue = Number(row.price) || 0;

  let status = "Estable";
  let statusClass = "bg-emerald-100 text-emerald-700";

  if (stock <= 3) {
    status = "Critico";
    statusClass = "bg-rose-100 text-rose-700";
  } else if (stock <= 8) {
    status = "Reponer";
    statusClass = "bg-amber-100 text-amber-700";
  }

  return {
    id: row.id,
    name: row.name || "Producto sin nombre",
    description: row.description || "",
    sku: `SKU-${row.id}`,
    category: getCategoryName(row, categories),
    categoryId: row.categoryId ?? row.category?.id ?? "",
    stock,
    status,
    statusClass,
    price: formatGs(priceValue),
    priceValue,
  };
}

function buildInventoryStats(products) {
  const totalProducts = products.length;
  const criticalStock = products.filter((product) => product.stock <= 3).length;
  const toRestock = products.filter((product) => product.stock <= 8).length;
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.priceValue, 0);

  return [
    { icon: "inventory_2", value: totalProducts.toString(), label: "Productos activos", tone: "bg-sky-100 text-sky-700" },
    { icon: "warning", value: criticalStock.toString(), label: "Stock critico", tone: "bg-amber-100 text-amber-700" },
    { icon: "local_shipping", value: toRestock.toString(), label: "Por reponer", tone: "bg-violet-100 text-violet-700" },
    { icon: "sell", value: formatGs(inventoryValue), label: "Valor inventario", tone: "bg-emerald-100 text-emerald-700" },
  ];
}

function buildSpotlightProducts(products) {
  const tones = ["from-rose-500/15 via-white to-white", "from-amber-500/15 via-white to-white", "from-cyan-500/15 via-white to-white"];
  const icons = ["disc_full", "oil_barrel", "battery_charging_full"];
  const trends = ["+12%", "+7%", "-3%"];

  return [...products]
    .sort((left, right) => right.stock - left.stock)
    .slice(0, 3)
    .map((product, index) => ({
      ...product,
      trend: trends[index] ?? "0%",
      tone: tones[index] ?? "from-slate-500/15 via-white to-white",
      icon: icons[index] ?? "inventory_2",
    }));
}

function buildPurchaseAlerts(products) {
  return products
    .filter((product) => product.stock <= 8)
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 3)
    .map((product) => ({
      title: product.name,
      note: `${product.stock} unidades disponibles`,
      icon: product.stock <= 3 ? "priority_high" : "schedule",
    }));
}

function buildCategoryShare(products) {
  const total = products.length;
  if (!total) {
    return [];
  }

  const counters = products.reduce((accumulator, product) => {
    const current = accumulator.get(product.category) ?? 0;
    accumulator.set(product.category, current + 1);
    return accumulator;
  }, new Map());

  const colors = ["bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-violet-500", "bg-emerald-500"];

  return [...counters.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, amount], index) => ({
      label,
      percentage: `${Math.round((amount / total) * 100)}%`,
      color: colors[index] ?? "bg-slate-500",
    }));
}

function buildProductFields(categories) {
  return [
    { name: "name", label: "Nombre del producto", placeholder: "Ej: Filtro de Aire K&N", required: true },
    { name: "description", label: "Descripcion", placeholder: "Detalles del producto", type: "textarea" },
    { name: "price", label: "Precio", placeholder: "Ej: 219000", type: "number", required: true },
    { name: "stock", label: "Stock inicial", placeholder: "Ej: 10", type: "number" },
    {
      name: "categoryId",
      label: "Categoria",
      type: "select",
      options: [{ value: "", label: "Seleccionar categoria" }, ...categories.map((category) => ({ value: category.id, label: category.name }))],
    },
  ];
}

export default function Products() {
  const canManageProducts = isAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [spotlightProducts, setSpotlightProducts] = useState([]);
  const [purchaseAlerts, setPurchaseAlerts] = useState([]);
  const [categoryShare, setCategoryShare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const productFields = buildProductFields(categories);

  function syncProductViews(nextProducts) {
    setProducts(nextProducts);
    setInventoryStats(buildInventoryStats(nextProducts));
    setSpotlightProducts(buildSpotlightProducts(nextProducts));
    setPurchaseAlerts(buildPurchaseAlerts(nextProducts));
    setCategoryShare(buildCategoryShare(nextProducts));
  }

  async function loadCategories() {
    const data = await get("/categories");
    return Array.isArray(data) ? data : [];
  }

  async function loadProducts(categoryRows) {
    const data = await get("/products");
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row) => mapProduct(row, categoryRows));
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const categoryRows = await loadCategories();
        const mappedProducts = await loadProducts(categoryRows);

        setCategories(categoryRows);
        syncProductViews(mappedProducts);
      } catch (requestError) {
        console.error("Error cargando productos:", requestError);
        setError("No se pudieron cargar los productos y categorias. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSubmitError("");
  }

  async function handleSaveProduct(formData) {
    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock) || 0,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
    };

    try {
      let savedProduct;

      if (editingProduct) {
        savedProduct = await put(`/products/${editingProduct.id}`, payload);
      } else {
        savedProduct = await post("/products", payload);
      }

      const mappedProduct = mapProduct(savedProduct, categories);
      const updatedProducts = editingProduct
        ? products.map((product) => (product.id === editingProduct.id ? mappedProduct : product))
        : [mappedProduct, ...products];

      syncProductViews(updatedProducts);
      closeModal();
    } catch (requestError) {
      console.error("Error guardando producto:", requestError);
      setSubmitError("No se pudo guardar el producto. Revisa los datos e intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) {
      return;
    }

    setIsDeleting(true);

    try {
      await del(`/products/${selectedProduct.id}`);
      const updatedProducts = products.filter((product) => product.id !== selectedProduct.id);

      syncProductViews(updatedProducts);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (requestError) {
      console.error("Error eliminando producto:", requestError);
      setError("No se pudo eliminar el producto. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  const modalInitialValues = editingProduct
    ? {
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.priceValue),
        stock: String(editingProduct.stock),
        categoryId: editingProduct.categoryId ? String(editingProduct.categoryId) : "",
      }
    : {};

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(19,91,236,0.14),_transparent_30%),linear-gradient(135deg,_#ffffff,_#eef4ff_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(19,91,236,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a,_#0f1c37_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Inventario central</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Productos listos para vender, reponer y rotar.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Control de inventario en tiempo real con creacion, edicion y eliminacion de productos.
            </p>
            {error && <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {inventoryStats.map((item) => (
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catalogo destacado</h2>
                <p className="text-sm text-slate-500">Productos con mayor disponibilidad en stock.</p>
              </div>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                disabled={!canManageProducts}
                onClick={openCreateModal}
                type="button"
              >
                <Icon className="text-base" name="add" />
                Nuevo producto
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {loading && <p className="text-sm text-slate-500">Cargando productos...</p>}
              {spotlightProducts.map((product) => (
                <SpotlightCard key={product.id} {...product} />
              ))}
              {!loading && spotlightProducts.length === 0 && <p className="text-sm text-slate-500">Sin productos para mostrar.</p>}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inventario por producto</h2>
                <p className="text-sm text-slate-500">Control rapido de stock, categoria y estado de reposicion.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4 font-semibold">Producto</th>
                    <th className="px-5 py-4 font-semibold">Categoria</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                    <th className="px-5 py-4 font-semibold">Precio</th>
                    <th className="px-5 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 text-sm last:border-0 dark:border-slate-800/80">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">{product.name}</span>
                          <span className="text-xs text-slate-500">{product.sku}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{product.category}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.statusClass}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{product.price}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                            disabled={!canManageProducts}
                            onClick={() => openEditModal(product)}
                            type="button"
                          >
                            <Icon className="text-sm" name="edit" />
                            Editar
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                            disabled={!canManageProducts}
                            onClick={() => {
                              setSelectedProduct(product);
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
                  {products.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan="6">
                        {loading ? "Cargando productos..." : "No hay productos para mostrar. Crea uno nuevo para comenzar."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Reposicion</p>
                <h2 className="mt-2 text-xl font-bold">Compra sugerida</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon name="shopping_bag" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {purchaseAlerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                      <Icon className="text-base" name={alert.icon} />
                    </div>
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{alert.note}</p>
                    </div>
                  </div>
                </div>
              ))}
              {purchaseAlerts.length === 0 && <p className="text-sm text-slate-300">Sin alertas de reposicion.</p>}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mapa de categorias</h2>
              <Icon className="text-slate-400" name="category" />
            </div>

            <div className="mt-5 space-y-4">
              {categoryShare.map((item) => (
                <CategoryRow key={item.label} {...item} />
              ))}
              {categoryShare.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Sin categorias para mostrar.</p>}
            </div>
          </div>
        </aside>
      </section>

      <FormModal
        fields={productFields}
        initialValues={modalInitialValues}
        isLoading={isSubmitting}
        isOpen={canManageProducts && isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveProduct}
        submitLabel={editingProduct ? "Guardar cambios" : "Crear producto"}
        title={editingProduct ? "Editar producto" : "Nuevo producto"}
      />
      {submitError && (
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>
      )}

      <ConfirmDialog
        isDangerous
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={`Estas seguro de que deseas eliminar "${selectedProduct?.name}"? Esta accion no se puede deshacer.`}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Eliminar producto"
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
      <p className="break-words text-base font-black leading-tight text-slate-900 dark:text-white sm:text-xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">{label}</p>
    </article>
  );
}

function SpotlightCard({ name, sku, category, stock, trend, tone, icon }) {
  return (
    <article className={`rounded-[24px] border border-slate-200 bg-gradient-to-br ${tone} p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon name={icon} />
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-lg font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{sku}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoChip icon="category" label={category} />
        <InfoChip icon="inventory_2" label={`${stock} uds`} />
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

function CategoryRow({ label, percentage, color }) {
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
