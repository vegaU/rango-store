import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import { get, post } from "../lib/api";
import { formatGs } from "../utils/currency";


function parseTicketItems(notes) {
  const payload = parseTicketPayload(notes);
  return Array.isArray(payload.items) ? payload.items : [];
}

function parseTicketPayload(notes) {
  if (!notes) {
    return {};
  }

  try {
    return JSON.parse(notes);
  } catch {
    return {};
  }
}

function buildTicketDocument({ saleId, customerName, items, total, notes }) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">${formatGs(item.priceValue)}</td>
          <td style="text-align:right;">${formatGs(item.quantity * item.priceValue)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Ticket VTA-${saleId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
        h1, h2, p { margin: 0; }
        .header { margin-bottom: 20px; }
        .meta { margin-top: 8px; font-size: 12px; color: #4b5563; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px 0; font-size: 12px; }
        th { text-align: left; color: #6b7280; }
        .total { margin-top: 16px; text-align: right; font-size: 16px; font-weight: bold; }
        .notes { margin-top: 18px; font-size: 12px; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rango Store</h1>
        <div class="meta">
          <p>Ticket: VTA-${saleId}</p>
          <p>Cliente: ${customerName}</p>
          <p>Fecha: ${new Date().toLocaleString("es-PY")}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align:center;">Cant.</th>
            <th style="text-align:right;">Precio</th>
            <th style="text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p class="total">Total: ${formatGs(total)}</p>
      ${notes ? `<p class="notes">Notas: ${notes}</p>` : ""}
      <script>window.onload = function () { window.print(); };</script>
    </body>
  </html>`;
}

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saleCustomerId, setSaleCustomerId] = useState("");
  const [salePaymentMethod, setSalePaymentMethod] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [saleItems, setSaleItems] = useState([]);
  const [saleError, setSaleError] = useState("");
  const [createdSale, setCreatedSale] = useState(null);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  function syncSales(nextSales) {
    setSales(nextSales);
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [salesData, customersData, productsData] = await Promise.all([
          get("/sales"),
          get("/customers"),
          get("/products"),
        ]);

        const safeSales = Array.isArray(salesData) ? salesData : [];
        const safeCustomers = Array.isArray(customersData) ? customersData : [];
        const safeProducts = Array.isArray(productsData) ? productsData : [];

        setCustomers(safeCustomers);
        setProducts(safeProducts);
        syncSales(safeSales);
        if (!saleCustomerId && safeCustomers.length) {
          setSaleCustomerId(String(safeCustomers[0].id));
        }
      } catch (requestError) {
        console.error("Error cargando ventas:", requestError);
        setError("No se pudieron cargar las ventas. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const customerById = new Map(customers.map((customer) => [customer.id, customer.name]));
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const saleTotal = useMemo(() => {
    return saleItems.reduce((sum, item) => {
      const product = productById.get(item.productId);
      const price = product ? Number(product.price) : 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [saleItems, productById]);

  function buildSaleItem(productId, quantity = 1) {
    return {
      productId,
      quantity,
    };
  }

  function openCreateSale() {
    setSaleError("");
    setSalePaymentMethod("");
    setSaleNotes("");
    setSaleItems([]);
    setIsCreateOpen(true);
  }

  function closeCreateSale() {
    setSaleError("");
    setSalePaymentMethod("");
    setIsCreateOpen(false);
  }

  function updateSaleItem(index, field, value) {
    setSaleItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: Number(value) } : item,
      ),
    );
  }

  function removeSaleItem(index) {
    setSaleItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function addSaleItem() {
    if (!products.length) {
      return;
    }

    setSaleItems((current) => [...current, buildSaleItem(0, 1)]);
    setSelectedItemIndex(saleItems.length);
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
      updateSaleItem(selectedItemIndex, "productId", productId);
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
    return products.filter((product) =>
      product.name.toLowerCase().includes(search),
    );
  }, [products, productSearch]);

  async function handleCreateSale() {
    if (!saleCustomerId) {
      setSaleError("Selecciona un cliente para la venta.");
      return;
    }

    if (!salePaymentMethod) {
      setSaleError("Selecciona un método de pago.");
      return;
    }

    if (!saleItems.length || saleItems.every((item) => !item.productId || Number(item.quantity) <= 0)) {
      setSaleError("Agrega al menos un producto con cantidad válida.");
      return;
    }

    setIsSaving(true);
    setSaleError("");

    try {
      const salePayload = {
        customerId: Number(saleCustomerId),
        paymentMethod: salePaymentMethod,
        total: saleTotal,
        notes: JSON.stringify({
          items: saleItems.map((item) => {
            const product = productById.get(item.productId);
            return {
              productId: item.productId,
              name: product?.name ?? "Producto desconocido",
              priceValue: Number(product?.price) || 0,
              quantity: Number(item.quantity) || 0,
            };
          }),
          extraNotes: saleNotes,
        }),
      };

      const newSale = await post("/sales", salePayload);
      setSales((current) => [newSale, ...current]);
      setCreatedSale(newSale);
      setIsCreateOpen(false);
      setSaleNotes("");
      setSaleItems([]);
      setSalePaymentMethod("");
    } catch (requestError) {
      console.error("Error creando venta:", requestError);
      setSaleError("No se pudo crear la venta. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  const paymentMethods = [
    { value: "Efectivo", label: "Efectivo" },
    { value: "Tarjeta débito/crédito", label: "Tarjeta débito/crédito" },
    { value: "Cheque", label: "Cheque" },
    { value: "Otro", label: "Otro" },
  ];

  function closeCreatedSaleSummary() {
    setCreatedSale(null);
  }

  function buildInvoiceDocument({ saleId, customerName, items, total, notes }) {
    const rows = items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${formatGs(item.priceValue)}</td>
            <td style="text-align:right;">${formatGs(item.quantity * item.priceValue)}</td>
          </tr>`,
      )
      .join("");

    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Factura VTA-${saleId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
        h1, h2, p { margin: 0; }
        .header { margin-bottom: 24px; }
        .meta { margin-top: 8px; font-size: 12px; color: #4b5563; }
        .customer { margin-top: 16px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 0; font-size: 13px; }
        th { text-align: left; color: #6b7280; }
        .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
        .notes { margin-top: 18px; font-size: 12px; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rango Store</h1>
        <div class="meta">
          <p>Factura: VTA-${saleId}</p>
          <p>Fecha: ${new Date().toLocaleDateString("es-PY")}</p>
        </div>
      </div>
      <div class="customer">
        <p><strong>Cliente:</strong> ${customerName}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align:center;">Cant.</th>
            <th style="text-align:right;">Precio</th>
            <th style="text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p class="total">Total: ${formatGs(total)}</p>
      ${notes ? `<p class="notes">Notas: ${notes}</p>` : ""}
      <script>window.onload = function () { window.print(); };</script>
    </body>
  </html>`;
  }

  function printInvoice(sale) {
    const ticketPayload = parseTicketPayload(sale.notes);
    const items = sale.items ?? parseTicketItems(sale.notes);
    const customerName =
      customerById.get(sale.customerId) ??
      ticketPayload.walkInCustomerName ??
      (sale.customerId === 0 ? "Cliente ocasional" : `Cliente #${sale.customerId ?? "N/A"}`);
    const printWindow = window.open("", "_blank", "width=720,height=900");

    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresion. Revisa si el navegador bloqueo el popup.");
      return;
    }

    printWindow.document.write(
      buildInvoiceDocument({
        saleId: sale.id,
        customerName,
        items,
        total: Number(sale.total) || 0,
        notes: ticketPayload.extraNotes ?? "",
      }),
    );
    printWindow.document.close();
  }

  function printTicket(sale) {
    const ticketPayload = parseTicketPayload(sale.notes);
    const items = sale.items ?? parseTicketItems(sale.notes);
    const customerName =
      customerById.get(sale.customerId) ??
      ticketPayload.walkInCustomerName ??
      (sale.customerId === 0 ? "Cliente ocasional" : `Cliente #${sale.customerId ?? "N/A"}`);
    const printWindow = window.open("", "_blank", "width=720,height=900");

    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresion. Revisa si el navegador bloqueo el popup.");
      return;
    }

    printWindow.document.write(
      buildTicketDocument({
        saleId: sale.id,
        customerName,
        items,
        total: Number(sale.total) || 0,
        notes: ticketPayload.extraNotes ?? "",
      }),
    );
    printWindow.document.close();
  }


  return (
    <div className="space-y-6">
      <section className="grid gap-6">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Ventas recientes</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Lista limpia de ventas registradas.</p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              onClick={openCreateSale}
              type="button"
            >
              <Icon className="text-base" name="add" />
              Nueva venta
            </button>
          </div>
          {error && <p className="px-5 py-3 text-sm font-medium text-rose-600">{error}</p>}

          <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Pago</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="premium-row text-sm hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                      <td className="px-5 py-4.5 font-extrabold text-slate-900 dark:text-white">VTA-{sale.id}</td>
                      <td className="px-5 py-4.5 font-medium text-slate-600 dark:text-slate-350">
                        {customerById.get(sale.customerId) ??
                          parseTicketPayload(sale.notes).walkInCustomerName ??
                          (sale.customerId === 0 ? "Cliente ocasional" : `Cliente #${sale.customerId ?? "N/A"}`)}
                      </td>
                      <td className="px-5 py-4.5 text-slate-700 dark:text-slate-300">
                        {sale.paymentMethod ?? "-"}
                      </td>
                      <td className="px-5 py-4.5 font-black text-slate-900 dark:text-white">{formatGs(Number(sale.total) || 0)}</td>
                      <td className="px-5 py-4.5 text-slate-500 dark:text-slate-400">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("es-PY") : "-"}
                      </td>
                      <td className="px-5 py-4.5 space-x-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition-all hover:bg-sky-100 hover:scale-102 active:scale-98 dark:bg-sky-950/20 dark:text-sky-300 dark:hover:bg-sky-900/30"
                          onClick={() => printTicket(sale)}
                          type="button"
                        >
                          <Icon className="text-base" name="print" />
                          Ticket
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:scale-102 active:scale-98 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                          onClick={() => printInvoice(sale)}
                          type="button"
                        >
                          <Icon className="text-base" name="print" />
                          Factura
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500" colSpan="6">
                        {loading ? "Cargando ventas..." : "No hay ventas para mostrar. Crea una nueva venta para comenzar."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800 flex-shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nueva venta</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreateSale}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <div className="space-y-5 overflow-y-auto px-6 py-5 flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selecciona el cliente
                    <select
                      value={saleCustomerId}
                      onChange={(e) => setSaleCustomerId(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Método de pago
                    <select
                      value={salePaymentMethod}
                      onChange={(e) => setSalePaymentMethod(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="">Selecciona método de pago</option>
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Productos</h4>
                      <button
                        type="button"
                        onClick={addSaleItem}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                      >
                        <Icon className="text-sm" name="add" />
                        Agregar
                      </button>
                    </div>

                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {saleItems.map((item, index) => {
                        const product = productById.get(item.productId);
                        const subtotal = product ? Number(product.price) * Number(item.quantity) : 0;
                        return (
                          <div key={`${item.productId}-${index}`} className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950 sm:gap-4">
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => openProductPicker(index)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 transition hover:bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                              >
                                {productById.get(item.productId)?.name || "Selecciona..."}
                              </button>
                            </div>

                            <div className="w-20">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateSaleItem(index, "quantity", e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="w-24 text-right text-xs font-bold text-slate-600 dark:text-slate-400">
                              {formatGs(subtotal)}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSaleItem(index)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                            >
                              <Icon className="text-base" name="delete" />
                            </button>
                          </div>
                        );
                      })}

                      {!saleItems.length && (
                        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">Sin productos aún</p>
                      )}
                    </div>
                  </div>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Notas (opcional)
                    <textarea
                      value={saleNotes}
                      onChange={(e) => setSaleNotes(e.target.value)}
                      rows={2}
                      placeholder="Ej: Extra de hielo, sin azúcar..."
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </label>

                  <div className="rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10 p-4 dark:from-primary/20 dark:to-primary/10">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      TOTAL:{" "}
                      <span className="text-lg font-black text-slate-900 dark:text-white">{formatGs(saleTotal)}</span>
                    </p>
                  </div>

                  {saleError && (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                      {saleError}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 flex-shrink-0 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeCreateSale}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSale}
                    disabled={isSaving || !saleItems.length}
                    className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Guardando..." : "Registrar venta"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isProductPickerOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
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
                              <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {product.stock || "N/A"}</p>
                            </div>
                            <p className="font-bold text-primary">{formatGs(Number(product.price))}</p>
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

          {createdSale && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Venta registrada</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Elige ticket o factura para finalizar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreatedSaleSummary}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Cliente:</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{customerById.get(createdSale.customerId) ?? `Cliente #${createdSale.customerId}`}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Método de pago:</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{createdSale.paymentMethod ?? "No especificado"}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => printTicket(createdSale)}
                      className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Imprimir Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => printInvoice(createdSale)}
                      className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Imprimir Factura
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreatedSaleSummary}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}
      </section>
    </div>
  );
}
