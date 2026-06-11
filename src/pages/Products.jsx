import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post, put } from "../lib/api";
import { isAdmin } from "../lib/permissions";
import { formatGs, parseGs } from "../utils/currency";

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
  const salePriceValue = Number(row.salePrice) || 0;
  const purchaseCostValue = Number(row.purchaseCost) || 0;
  const lastCostValue = Number(row.lastCost) || 0;
  const minStock = Number(row.minStock) || 0;

  let status = "Estable";
  let statusClass = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-500/15";

  if (minStock > 0 && stock <= minStock) {
    status = "Crítico";
    statusClass = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 ring-1 ring-rose-500/15";
  } else if (stock <= 3) {
    status = "Crítico";
    statusClass = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 ring-1 ring-rose-500/15";
  } else if (stock <= 8) {
    status = "Reponer";
    statusClass = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-500/15";
  }

  const margin = purchaseCostValue > 0 ? Math.round(((salePriceValue - purchaseCostValue) / purchaseCostValue) * 100) : 0;

  return {
    id: row.id,
    code: row.code || "",
    name: row.name || "Producto sin nombre",
    description: row.description || "",
    sku: `SKU-${row.id}`,
    category: getCategoryName(row, categories),
    categoryId: row.categoryId ?? row.category?.id ?? "",
    stock,
    minStock,
    status,
    statusClass,
    salePrice: formatGs(salePriceValue),
    salePriceValue,
    purchaseCost: formatGs(purchaseCostValue),
    purchaseCostValue,
    lastCost: formatGs(lastCostValue),
    lastCostValue,
    margin,
  };
}

function buildProductFields(categories) {
  return [
    { name: "code", label: "Codigo", placeholder: "Ej: FA-001", required: false },
    { name: "name", label: "Nombre del producto", placeholder: "Ej: Filtro de Aire K&N", required: true },
    { name: "description", label: "Descripcion", placeholder: "Detalles del producto", type: "textarea" },
    { name: "salePrice", label: "Precio de venta", placeholder: "Ej: 219.000", type: "currency", required: true },
    { name: "purchaseCost", label: "Costo de compra", placeholder: "Ej: 150.000", type: "currency" },
    { name: "stock", label: "Stock inicial", placeholder: "Ej: 10", type: "number" },
    { name: "minStock", label: "Stock minimo", placeholder: "Ej: 3", type: "number" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const location = useLocation();
  const filterMode = useMemo(() => new URLSearchParams(location.search).get("filter"), [location.search]);
  const productFields = buildProductFields(categories);

  function syncProductViews(nextProducts) {
    setProducts(nextProducts);
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
      code: formData.code || undefined,
      name: formData.name,
      description: formData.description,
      salePrice: parseGs(formData.salePrice),
      purchaseCost: parseGs(formData.purchaseCost) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
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

  const visibleProducts = useMemo(() => {
    if (filterMode === "lowStock") {
      return products.filter((product) => Number(product.stock) <= 5);
    }
    return products;
  }, [products, filterMode]);

  const modalInitialValues = editingProduct
    ? {
        code: editingProduct.code || "",
        name: editingProduct.name,
        description: editingProduct.description,
        salePrice: String(editingProduct.salePriceValue),
        purchaseCost: String(editingProduct.purchaseCostValue),
        stock: String(editingProduct.stock),
        minStock: String(editingProduct.minStock),
        categoryId: editingProduct.categoryId ? String(editingProduct.categoryId) : "",
      }
    : {};

  return (
    <div className="space-y-6">
      <section className="grid gap-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Inventario por producto</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Lista limpia de productos y stock disponible.</p>
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
          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4">Producto</th>
                  <th className="px-5 py-4">Categoría</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Costo</th>
                  <th className="px-5 py-4 text-right">Precio Vta</th>
                  <th className="px-5 py-4 text-right">Margen</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {visibleProducts.map((product) => (
                  <tr key={product.id} className="premium-row text-sm hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                    <td className="px-5 py-4.5">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900 dark:text-white">{product.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{product.sku}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4.5 font-medium text-slate-500 dark:text-slate-400">{product.category}</td>
                    <td className="px-5 py-4.5">
                      <span className="inline-flex min-w-10 justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4.5">
                      <span className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-black tracking-wide ${product.statusClass}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 text-right font-medium text-slate-500 dark:text-slate-400">{product.purchaseCost}</td>
                    <td className="px-5 py-4.5 text-right font-black text-slate-900 dark:text-white">{product.salePrice}</td>
                    <td className="px-5 py-4.5 text-right">
                      {product.margin > 0 ? (
                        <span className={`inline-flex rounded-xl px-2 py-1 text-[10px] font-black tracking-wide ${
                          product.margin >= 30
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
                        }`}>
                          {product.margin}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4.5">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition-all hover:bg-sky-100 hover:scale-102 active:scale-98 dark:bg-sky-950/20 dark:text-sky-300 dark:hover:bg-sky-900/30"
                          disabled={!canManageProducts}
                          onClick={() => openEditModal(product)}
                          type="button"
                        >
                          <Icon className="text-base" name="edit" />
                          Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 hover:scale-102 active:scale-98 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
                          disabled={!canManageProducts}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteDialogOpen(true);
                          }}
                          type="button"
                        >
                          <Icon className="text-base" name="delete" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleProducts.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500" colSpan="6">
                      {loading ? "Cargando productos..." : filterMode === "lowStock" ? "No hay productos en bajo stock." : "No hay productos para mostrar. Crea uno nuevo para comenzar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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

