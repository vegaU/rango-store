import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import { get, post } from "../lib/api";
import { formatGs, formatGsInput, parseGs } from "../utils/currency";

const paymentMethods = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta débito/crédito", label: "Tarjeta débito/crédito" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Otro", label: "Otro" },
];

function findProduct(products, productId) {
  return products.find((product) => product.id === Number(productId));
}

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [formError, setFormError] = useState("");
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [purchasesData, productsData] = await Promise.all([
          get("/purchases"),
          get("/products"),
        ]);

        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (requestError) {
        console.error("Error cargando compras:", requestError);
        setError("No se pudieron cargar las compras. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const purchaseTotal = useMemo(() => {
    return purchaseItems.reduce((sum, item) => {
      const cost = Number(item.cost) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + cost * quantity;
    }, 0);
  }, [purchaseItems]);

  function openCreatePurchase() {
    setSupplier("");
    setPaymentMethod("");
    setNotes("");
    setPurchaseItems([]);
    setFormError("");
    setIsCreateOpen(true);
  }

  function closeCreatePurchase() {
    setIsCreateOpen(false);
    setFormError("");
  }

  function updatePurchaseItem(index, field, value) {
    setPurchaseItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: Number(value) }
          : item,
      ),
    );
  }

  function addPurchaseItem() {
    if (!products.length) {
      setFormError("No hay productos existentes. Crea productos en Inventario antes de registrar una compra.");
      return;
    }

    setPurchaseItems((current) => [...current, { productId: 0, quantity: 1, cost: 0 }]);
    setSelectedItemIndex(purchaseItems.length);
    setProductSearch("");
    setIsProductPickerOpen(true);
  }

  function openProductPicker(itemIndex) {
    setSelectedItemIndex(itemIndex);
    setProductSearch("");
    setIsProductPickerOpen(true);
  }

  function selectProduct(productId) {
    if (selectedItemIndex !== null) {
      const product = findProduct(products, productId);
      setPurchaseItems((current) =>
        current.map((item, idx) =>
          idx === selectedItemIndex
            ? {
                ...item,
                productId: Number(productId),
                cost: item.cost || Number(product?.purchaseCost) || 0,
              }
            : item,
        ),
      );
    }
    setIsProductPickerOpen(false);
    setProductSearch("");
  }

  function closeProductPicker() {
    setIsProductPickerOpen(false);
    setProductSearch("");
  }

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) {
      return products;
    }

    const search = productSearch.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        (product.code && product.code.toLowerCase().includes(search)),
    );
  }, [products, productSearch]);

  function removePurchaseItem(index) {
    setPurchaseItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSavePurchase() {
    if (!products.length) {
      setFormError("No hay productos existentes. Crea productos en Inventario antes de registrar una compra.");
      return;
    }

    if (!supplier.trim()) {
      setFormError("Escribe el proveedor de la compra.");
      return;
    }

    if (!paymentMethod) {
      setFormError("Selecciona un método de pago.");
      return;
    }

    if (!purchaseItems.length || purchaseItems.every((item) => !item.productId || Number(item.quantity) <= 0)) {
      setFormError("Agrega al menos un producto con cantidad válida.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const payload = {
        supplier: supplier.trim(),
        paymentMethod,
        total: purchaseTotal,
        notes: JSON.stringify({
          items: purchaseItems.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity) || 0,
            cost: Number(item.cost) || 0,
          })),
          extraNotes: notes,
        }),
      };

      const newPurchase = await post("/purchases", payload);
      setPurchases((current) => [newPurchase, ...current]);
      closeCreatePurchase();
    } catch (requestError) {
      console.error("Error creando compra:", requestError);
      setFormError("No se pudo registrar la compra. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Compras</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Registra y revisa las compras de stock realizadas.</p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              onClick={openCreatePurchase}
              type="button"
            >
              <Icon className="text-base" name="add" />
              Nueva compra
            </button>
          </div>

          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Proveedor</th>
                  <th className="px-5 py-4">Pago</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="premium-row text-sm hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                    <td className="px-5 py-4.5 font-extrabold text-slate-900 dark:text-white">CMP-{purchase.id}</td>
                    <td className="px-5 py-4.5 font-medium text-slate-600 dark:text-slate-300">{purchase.supplier}</td>
                    <td className="px-5 py-4.5 text-slate-700 dark:text-slate-300">{purchase.paymentMethod ?? "-"}</td>
                    <td className="px-5 py-4.5 font-black text-slate-900 dark:text-white">{formatGs(Number(purchase.total) || 0)}</td>
                    <td className="px-5 py-4.5 text-slate-500 dark:text-slate-400">{purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString("es-PY") : "-"}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500" colSpan="5">
                      {loading ? "Cargando compras..." : "No hay compras registradas. Agrega una nueva compra para comenzar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registrar compra</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Agrega los productos que ingresan al inventario.</p>
              </div>
              <button
                type="button"
                onClick={closeCreatePurchase}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-5 flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Proveedor
                  <input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    placeholder="Nombre del proveedor"
                    type="text"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Método de pago
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Seleccionar método</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!products.length && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/70 dark:bg-amber-950/20 dark:text-amber-200">
                  <p className="font-semibold">Productos existentes necesarios</p>
                  <p className="mt-2">Antes de registrar una compra necesitas crear productos en Inventario.</p>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
                <div className="flex items-center justify-between gap-3 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Productos de la compra</h4>
                  <button
                    type="button"
                    onClick={addPurchaseItem}
                    disabled={!products.length}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Icon name="add" className="text-base" />
                    Agregar producto
                  </button>
                </div>
                {purchaseItems.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Agrega productos para incluirlos en la compra.</p>
                ) : (
                  <div className="space-y-3">
                    {purchaseItems.map((item, index) => {
                      const product = findProduct(products, item.productId);
                      const cost = Number(item.cost) || 0;
                      const quantity = Number(item.quantity) || 0;
                      const subtotal = cost * quantity;
                      return (
                        <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                          <div className="grid gap-3 sm:grid-cols-[1.5fr,0.7fr,0.7fr,auto] items-end">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Producto
                              <button
                                type="button"
                                onClick={() => openProductPicker(index)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                              >
                                {product?.name || "Selecciona un producto"}
                              </button>
                            </label>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Costo unitario
                              <input
                                type="text"
                                value={item.cost ? formatGsInput(item.cost) : ""}
                                onChange={(e) => updatePurchaseItem(index, "cost", parseGs(e.target.value))}
                                placeholder="0"
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </label>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Cantidad
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updatePurchaseItem(index, "quantity", e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </label>

                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Subtotal: {formatGs(subtotal)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removePurchaseItem(index)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
                              >
                                <Icon name="delete" className="text-base" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Notas adicionales
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 h-24 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Ej: factura, números de guía, observaciones..."
                />
              </label>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                <p className="font-semibold">Total estimado</p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatGs(purchaseTotal)}</p>
              </div>

              {formError && <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={closeCreatePurchase}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePurchase}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSaving ? "Guardando..." : "Registrar compra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Selecciona un producto</h3>
              <button
                type="button"
                onClick={closeProductPicker}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product.id)}
                      className="w-full px-6 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-900 dark:active:bg-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {product.code ? `${product.code} · ` : ""}Stock: {product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatGs(Number(product.purchaseCost) || 0)}</p>
                          <p className="text-[10px] text-slate-400">Costo actual</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No se encontraron productos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}