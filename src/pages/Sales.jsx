import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import ConfirmDialog from "../components/ConfirmDialog";
import { del, get, post } from "../lib/api";
import { isAdmin } from "../lib/permissions";
import { formatGs } from "../utils/currency";

function buildStats(sales, cartTotal) {
  const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  const avgSale = sales.length > 0 ? totalSales / sales.length : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const salesToday = sales.filter((sale) => {
    const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
    return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= today;
  }).length;

  return [
    { icon: "point_of_sale", value: formatGs(totalSales), label: "Ventas totales", tone: "bg-emerald-100 text-emerald-700" },
    { icon: "receipt_long", value: sales.length.toString(), label: "Ventas registradas", tone: "bg-sky-100 text-sky-700" },
    { icon: "shopping_cart", value: formatGs(cartTotal), label: "Carrito actual", tone: "bg-amber-100 text-amber-700" },
    { icon: "monitoring", value: formatGs(avgSale), label: "Venta promedio", tone: "bg-violet-100 text-violet-700" },
    { icon: "calendar_month", value: salesToday.toString(), label: "Ventas hoy", tone: "bg-orange-100 text-orange-700" },
  ];
}

function normalizeProducts(products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name || "Producto sin nombre",
    priceValue: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
  }));
}

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
  const canDeleteSales = isAdmin();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [walkInCustomerName, setWalkInCustomerName] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [cart, setCart] = useState([]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.priceValue, 0),
    [cart],
  );

  function syncSales(nextSales, nextCartTotal = cartTotal) {
    setSales(nextSales);
    setStats(buildStats(nextSales, nextCartTotal));
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
        const safeProducts = Array.isArray(productsData) ? normalizeProducts(productsData) : [];

        setCustomers(safeCustomers);
        setProducts(safeProducts);
        syncSales(safeSales, 0);
      } catch (requestError) {
        console.error("Error cargando ventas:", requestError);
        setError("No se pudieron cargar las ventas. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    setStats(buildStats(sales, cartTotal));
  }, [cartTotal, sales]);

  const customerById = new Map(customers.map((customer) => [customer.id, customer.name]));
  const filteredProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return product.name.toLowerCase().includes(query) || `sku-${product.id}`.toLowerCase().includes(query);
  });

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock || item.quantity + 1) }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          priceValue: product.priceValue,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId, nextQuantity) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const quantity = Math.max(1, Math.min(nextQuantity, item.stock || nextQuantity));
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  function resetSaleComposer() {
    setSelectedCustomerId("");
    setWalkInCustomerName("");
    setSaleNotes("");
    setProductQuery("");
    setCart([]);
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
        notes: sale.extraNotes ?? "",
      }),
    );
    printWindow.document.close();
  }

  async function handleCreateSale() {
    const isWalkInCustomer = selectedCustomerId === "walk-in";

    if (!selectedCustomerId) {
      setSubmitError("Selecciona un cliente o marca cliente ocasional antes de registrar la venta.");
      return;
    }

    if (isWalkInCustomer && !walkInCustomerName.trim()) {
      setSubmitError("Escribe un nombre de referencia para el cliente ocasional.");
      return;
    }

    if (!cart.length) {
      setSubmitError("Agrega al menos un producto al carrito.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const notesPayload = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        priceValue: item.priceValue,
      })),
      comment: saleNotes,
      walkInCustomerName: isWalkInCustomer ? walkInCustomerName.trim() : "",
    };

    try {
      const newSale = await post("/sales", {
        customerId: isWalkInCustomer ? 0 : Number(selectedCustomerId),
        total: cartTotal,
        notes: JSON.stringify(notesPayload),
      });

      const enrichedSale = {
        ...newSale,
        items: notesPayload.items,
        extraNotes: saleNotes,
      };

      syncSales([enrichedSale, ...sales], 0);
      printTicket(enrichedSale);
      resetSaleComposer();
    } catch (requestError) {
      console.error("Error creando venta:", requestError);
      setSubmitError("No se pudo registrar la venta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSale() {
    if (!selectedSale) {
      return;
    }

    setIsDeleting(true);

    try {
      await del(`/sales/${selectedSale.id}`);
      syncSales(sales.filter((sale) => sale.id !== selectedSale.id));
      setIsDeleteDialogOpen(false);
      setSelectedSale(null);
    } catch (requestError) {
      console.error("Error eliminando venta:", requestError);
      setError("No se pudo eliminar la venta. Intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_#ffffff,_#fff6eb_55%,_#f8fafc)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a,_#24160d_55%,_#111827)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Operacion comercial</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Caja, carrito y ticket en una sola pantalla.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Arma la venta con productos reales, calcula el total al instante y genera un ticket imprimible al cerrar.
            </p>
            {error && <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:min-w-[540px]">
            {stats.map((item) => (
              <StatPill key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catalogo para venta</h2>
                <p className="text-sm text-slate-500">Busca productos y agregalos al carrito de la venta actual.</p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Icon className="text-slate-400" name="search" />
                <input
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200 sm:w-64"
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Buscar producto o SKU"
                  type="text"
                  value={productQuery}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="group rounded-[24px] border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800/70 dark:bg-slate-950/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">{product.name}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">SKU-{product.id}</p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-350 ring-1 ring-slate-250/20 dark:ring-slate-700/50">
                      {product.stock} uds
                    </span>
                  </div>

                  <p className="mt-4 text-lg font-black text-primary dark:text-indigo-400">{formatGs(product.priceValue)}</p>

                  <button
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:from-orange-400 hover:to-amber-400 hover:shadow-md hover:shadow-orange-500/10 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}
                    type="button"
                  >
                    <Icon className="text-base" name="add_shopping_cart" />
                    {product.stock > 0 ? "Agregar" : "Sin stock"}
                  </button>
                </article>
              ))}
              {!filteredProducts.length && (
                <div className="col-span-full py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                  {loading ? "Cargando catálogo..." : "No hay productos que coincidan con la búsqueda."}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Ventas Recientes</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Consulta ventas guardadas e imprime tickets al instante.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Cliente</th>
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
                      <td className="px-5 py-4.5 font-black text-slate-900 dark:text-white">{formatGs(Number(sale.total) || 0)}</td>
                      <td className="px-5 py-4.5 text-slate-500 dark:text-slate-400">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("es-PY") : "-"}
                      </td>
                      <td className="px-5 py-4.5">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition-all hover:bg-sky-100 hover:scale-102 active:scale-98 dark:bg-sky-950/20 dark:text-sky-300 dark:hover:bg-sky-900/30"
                            onClick={() => printTicket(sale)}
                            type="button"
                          >
                            <Icon className="text-base" name="print" />
                            Ticket
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 hover:scale-102 active:scale-98 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
                            disabled={!canDeleteSales}
                            onClick={() => {
                              setSelectedSale(sale);
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
                  {sales.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500" colSpan="5">
                        {loading ? "Cargando ventas..." : "No hay ventas para mostrar. Crea una nueva venta para comenzar."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">Caja Activa</p>
                <h2 className="mt-1 text-lg font-black tracking-tight">Carrito de compras</h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 shadow-sm text-orange-350">
                <Icon name="shopping_cart" className="text-xl" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Cliente</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  onChange={(event) => setSelectedCustomerId(event.target.value)}
                  value={selectedCustomerId}
                >
                  <option className="bg-slate-900 text-white" value="">Seleccionar cliente</option>
                  <option className="bg-slate-900 text-white" value="walk-in">Cliente ocasional</option>
                  {customers.map((customer) => (
                    <option className="bg-slate-900 text-white" key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerId === "walk-in" && (
                <div className="animate-fade-in duration-200">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Nombre de referencia</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    onChange={(event) => setWalkInCustomerName(event.target.value)}
                    placeholder="Ej: Cliente mostrador"
                    type="text"
                    value={walkInCustomerName}
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Notas de la Venta</label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-650 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  onChange={(event) => setSaleNotes(event.target.value)}
                  placeholder="Observaciones para la venta o la impresión..."
                  value={saleNotes}
                />
              </div>

              {/* Cart List Container */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 hover:border-white/15 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-white truncate">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatGs(item.priceValue)} c/u</p>
                      </div>
                      <button
                        className="text-slate-400 hover:text-rose-400 transition-colors duration-150 shrink-0"
                        onClick={() => removeFromCart(item.id)}
                        type="button"
                        title="Quitar"
                      >
                        <Icon name="close" className="text-lg" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                        <button className="flex size-7 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors" onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">
                          <Icon name="remove" className="text-sm" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-black">{item.quantity}</span>
                        <button className="flex size-7 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors" onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">
                          <Icon name="add" className="text-sm" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-orange-300">{formatGs(item.quantity * item.priceValue)}</p>
                    </div>
                  </div>
                ))}

                {!cart.length && (
                  <p className="text-center py-6 text-xs font-semibold text-slate-500">
                    El carrito está vacío. Agrega productos.
                  </p>
                )}
              </div>
            </div>

            {/* Total summary */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-450">
                <span>Ítems</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} uds</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-base font-black">
                <span>Total General</span>
                <span className="text-lg text-orange-300">{formatGs(cartTotal)}</span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-450">
                <Icon name="error" className="text-sm" />
                <p>{submitError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/10 hover:from-orange-400 hover:to-amber-400 hover:shadow-xl hover:scale-102 active:scale-98 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={handleCreateSale}
                type="button"
              >
                {isSubmitting ? "Registrando..." : "Cobrar e Imprimir"}
              </button>
              <button
                className="rounded-xl border border-white/20 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 hover:scale-102 active:scale-98"
                onClick={resetSaleComposer}
                type="button"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </aside>
      </section>

      <ConfirmDialog
        isDangerous
        isLoading={isDeleting}
        isOpen={canDeleteSales && isDeleteDialogOpen}
        message={`Estas seguro de que deseas eliminar la venta VTA-${selectedSale?.id}? Esta accion no se puede deshacer.`}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSale(null);
        }}
        onConfirm={handleDeleteSale}
        title="Eliminar venta"
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
