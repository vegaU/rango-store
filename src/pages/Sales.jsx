import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { get, post } from "../lib/api";
import { formatGs } from "../utils/currency";
import { getAuthUser } from "../lib/auth";

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

function buildTicketDocument({ saleId, customerName, items, total, notes, discount = 0 }) {
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
        .total-area { margin-top: 16px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 12px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .grand-total { font-size: 16px; font-weight: bold; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
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
      <div class="total-area">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatGs(total + discount)}</span>
        </div>
        ${discount ? `
        <div class="total-row" style="color: #dc2626;">
          <span>Descuento:</span>
          <span>-${formatGs(discount)}</span>
        </div>` : ""}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatGs(total)}</span>
        </div>
      </div>
      ${notes ? `<p class="notes">Notas: ${notes}</p>` : ""}
      <script>window.onload = function () { window.print(); };</script>
    </body>
  </html>`;
}

function buildInvoiceDocument({ saleId, customerName, items, total, notes, discount = 0 }) {
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
        .total-area { margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 13px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .grand-total { font-size: 18px; font-weight: bold; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
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
      <div class="total-area">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatGs(total + discount)}</span>
        </div>
        ${discount ? `
        <div class="total-row" style="color: #dc2626;">
          <span>Descuento:</span>
          <span>-${formatGs(discount)}</span>
        </div>` : ""}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatGs(total)}</span>
        </div>
      </div>
      ${notes ? `<p class="notes">Notas: ${notes}</p>` : ""}
      <script>window.onload = function () { window.print(); };</script>
    </body>
  </html>`;
}

function extractBrand(description) {
  if (!description) return "";
  const parts = description.split(",");
  return parts[0].trim();
}

export default function Sales() {
  const authUser = getAuthUser();
  const [activeTab, setActiveTab] = useState("pos"); // "pos" (Nueva Venta) o "historial" (Ventas Recientes)
  
  // Data lists from backend
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // POS / New Sale State
  const [saleCustomerId, setSaleCustomerId] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [salePaymentMethod, setSalePaymentMethod] = useState("Efectivo");
  const [saleNotes, setSaleNotes] = useState("");
  const [saleItems, setSaleItems] = useState([]);
  const [discountInput, setDiscountInput] = useState(0);
  
  // Autocomplete state
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  // Customer search & inline creation state
  const [rucInput, setRucInput] = useState("");
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [focusedCustomerIndex, setFocusedCustomerIndex] = useState(-1);
  const [showQuickCreateCustomer, setShowQuickCreateCustomer] = useState(false);
  const [newCustRuc, setNewCustRuc] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [inlineSubmitting, setInlineSubmitting] = useState(false);

  // Global submit states
  const [saleError, setSaleError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);

  // Refs for focusing
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const submitSaleRef = useRef(null);

  function syncSales(nextSales) {
    setSales(nextSales);
  }

  // Load backend data
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

        // No pre-select any customer - user must search and select manually
        setSaleCustomerId("");
        setActiveCustomer(null);
      } catch (requestError) {
        console.error("Error cargando ventas:", requestError);
        setError("No se pudieron cargar los datos de ventas. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Read search query param from URL (coming from TopBar search)
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setProductSearch(searchQuery);
      setShowSuggestions(true);
      setFocusedSuggestionIndex(-1);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [searchParams]);

  // Focus search input on POS mount
  useEffect(() => {
    if (activeTab === "pos" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeTab]);

  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  // Subtotal calculation (before discount)
  const saleTotal = useMemo(() => {
    return saleItems.reduce((sum, item) => {
      const product = productById.get(item.productId);
      const salePrice = product ? Number(product.salePrice) : 0;
      const quantity = Number(item.quantity) || 0;
      return sum + salePrice * quantity;
    }, 0);
  }, [saleItems, productById]);

  // Product Autocomplete filtering
  const matchingProducts = useMemo(() => {
    if (!productSearch.trim()) {
      return [];
    }
    const search = productSearch.toLowerCase().trim();
    return products.filter((product) => {
      const nameMatch = product.name?.toLowerCase().includes(search);
      const codeMatch = product.code?.toLowerCase().includes(search);
      const skuMatch = `sku-${product.id}`.toLowerCase().includes(search) || String(product.id) === search;
      const descMatch = product.description?.toLowerCase().includes(search);
      return nameMatch || codeMatch || skuMatch || descMatch;
    });
  }, [products, productSearch]);

  // Autocomplete selection
  function handleAddProductToCart(product) {
    if (!product) return;
    setSaleItems((current) => {
      const existingIdx = current.findIndex((item) => item.productId === product.id);
      if (existingIdx > -1) {
        return current.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { productId: product.id, quantity: 1 }];
    });

    // Reset input
    setProductSearch("");
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);

    // Refocus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }

  // Autocomplete keydown handler
  function handleSearchKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) =>
        prev < matchingProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < matchingProducts.length) {
        handleAddProductToCart(matchingProducts[focusedSuggestionIndex]);
      } else if (matchingProducts.length > 0) {
        handleAddProductToCart(matchingProducts[0]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    }
  }

  function handleAddFirstMatch() {
    if (matchingProducts.length > 0) {
      handleAddProductToCart(matchingProducts[0]);
    }
  }

  function updateSaleItem(index, field, value) {
    const numericVal = Math.max(1, Number(value) || 1);
    setSaleItems((current) =>
      current.map((item, idx) =>
        idx === index ? { ...item, [field]: numericVal } : item
      )
    );
  }

  function removeSaleItem(index) {
    setSaleItems((current) => current.filter((_, idx) => idx !== index));
  }

  // Customer search autocomplete
  const matchingCustomers = useMemo(() => {
    if (!rucInput.trim()) return [];
    const query = rucInput.toLowerCase().trim();
    return customers.filter((c) => {
      const cleanEmail = c.email ? c.email.toLowerCase().trim() : "";
      const rucMatch = cleanEmail === query || cleanEmail.replace("@ruc.com", "") === query;
      const nameMatch = c.name.toLowerCase().includes(query);
      return rucMatch || nameMatch;
    });
  }, [customers, rucInput]);

  function handleSelectCustomer(customer) {
    setActiveCustomer(customer);
    setSaleCustomerId(String(customer.id));
    setShowQuickCreateCustomer(false);
    setSaleError("");
    setRucInput("");
    setShowCustomerSuggestions(false);
  }

  function handleCustomerSearchKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedCustomerIndex((prev) =>
        prev < matchingCustomers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedCustomerIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedCustomerIndex >= 0 && focusedCustomerIndex < matchingCustomers.length) {
        handleSelectCustomer(matchingCustomers[focusedCustomerIndex]);
      } else if (matchingCustomers.length > 0) {
        handleSelectCustomer(matchingCustomers[0]);
      } else if (rucInput.trim()) {
        // No matches, show quick create
        setSaleError("Cliente no encontrado. Se habilitó el registro rápido.");
        setNewCustRuc(rucInput);
        setShowQuickCreateCustomer(true);
        setShowCustomerSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowCustomerSuggestions(false);
      setFocusedCustomerIndex(-1);
    }
  }

  // Customer inline quick creation
  async function handleCreateCustomerInline() {
    if (!newCustRuc.trim() || !newCustName.trim()) {
      setSaleError("Por favor, ingresa el RUC/CI y el Nombre del cliente.");
      return;
    }

    setInlineSubmitting(true);
    setSaleError("");

    try {
      const emailValue = newCustRuc.includes("@") ? newCustRuc.trim() : `${newCustRuc.trim()}@ruc.com`;
      const newCustomer = await post("/customers", {
        name: newCustName.trim(),
        email: emailValue,
        phone: newCustPhone.trim() || undefined,
        address: newCustAddress.trim() || undefined,
      });

      setCustomers((current) => [newCustomer, ...current]);
      setActiveCustomer(newCustomer);
      setSaleCustomerId(String(newCustomer.id));
      
      // Clear inline form
      setNewCustRuc("");
      setNewCustName("");
      setNewCustPhone("");
      setNewCustAddress("");
      setShowQuickCreateCustomer(false);
      setRucInput("");
      setSaleError("");
    } catch (requestError) {
      console.error("Error creando cliente inline:", requestError);
      setSaleError("No se pudo registrar el cliente. Es posible que el RUC/CI ya exista.");
    } finally {
      setInlineSubmitting(false);
    }
  }

  // Create Sale handler
  async function handleCreateSale() {
    if (!saleCustomerId) {
      setSaleError("Selecciona un cliente para la venta.");
      return;
    }

    if (!salePaymentMethod) {
      setSaleError("Selecciona un método de pago.");
      return;
    }

    if (!saleItems.length) {
      setSaleError("Agrega al menos un producto al carrito.");
      return;
    }

    setIsSaving(true);
    setSaleError("");

    const calculatedTotal = Math.max(0, saleTotal - discountInput);

    try {
      const salePayload = {
        customerId: Number(saleCustomerId),
        paymentMethod: salePaymentMethod,
        total: calculatedTotal,
        notes: JSON.stringify({
          items: saleItems.map((item) => {
            const product = productById.get(item.productId);
            return {
              productId: item.productId,
              name: product?.name ?? "Producto desconocido",
              priceValue: Number(product?.salePrice) || 0,
              quantity: Number(item.quantity) || 0,
            };
          }),
          extraNotes: saleNotes,
          discount: discountInput,
        }),
      };

      const newSale = await post("/sales", salePayload);
      setSales((current) => [newSale, ...current]);
      setCreatedSale(newSale);

      // Reset POS form states
      setSaleItems([]);
      setSaleNotes("");
      setDiscountInput(0);
      setProductSearch("");
      setRucInput("");

      // Clear customer selection - user must search again
      setSaleCustomerId("");
      setActiveCustomer(null);

      // Refocus search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    } catch (requestError) {
      console.error("Error creando venta:", requestError);
      setSaleError("No se pudo registrar la venta. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  // Keep ref updated to avoid stale state in keyboard event listener
  submitSaleRef.current = handleCreateSale;

  // Keyboard Shortcuts Listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (activeTab === "pos") {
        if (e.key === "F2") {
          e.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        } else if (e.key === "F12") {
          e.preventDefault();
          if (submitSaleRef.current) {
            submitSaleRef.current();
          }
        } else if (e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          if (submitSaleRef.current) {
            submitSaleRef.current();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab]);

  function closeCreatedSaleSummary() {
    setCreatedSale(null);
  }

  function printInvoice(sale) {
    const ticketPayload = parseTicketPayload(sale.notes);
    const items = sale.items ?? parseTicketItems(sale.notes);
    const customerName =
      customerById.get(sale.customerId) ??
      ticketPayload.walkInCustomerName ??
      (sale.customerId === 0 ? "Cliente ocasional" : `Cliente #${sale.customerId ?? "N/A"}`);
    const discount = Number(ticketPayload.discount) || 0;

    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresión. Revisa si el navegador bloqueó el popup.");
      return;
    }

    printWindow.document.write(
      buildInvoiceDocument({
        saleId: sale.id,
        customerName,
        items,
        total: Number(sale.total) || 0,
        notes: ticketPayload.extraNotes ?? "",
        discount,
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
    const discount = Number(ticketPayload.discount) || 0;

    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresión. Revisa si el navegador bloqueó el popup.");
      return;
    }

    printWindow.document.write(
      buildTicketDocument({
        saleId: sale.id,
        customerName,
        items,
        total: Number(sale.total) || 0,
        notes: ticketPayload.extraNotes ?? "",
        discount,
      }),
    );
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={() => setActiveTab("pos")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "pos"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
          }`}
        >
          Registrar Venta
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "historial"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
          }`}
        >
          Historial de Ventas
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <Icon name="warning" className="text-base" />
          <p>{error}</p>
        </div>
      )}

      {/* POS View (Registrar Venta) */}
      {activeTab === "pos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Shop Header banner */}
          <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-primary/10 to-indigo-600/10 p-5 border border-primary/20 dark:from-primary/20 dark:to-indigo-900/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/20">
                  <Icon name="store" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">🏠 Repuestos Antonio</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Paraguay - Facturación y Caja</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-900/60 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <Icon name="person" className="text-primary text-sm" />
                <span>Vendedor: <strong className="text-slate-900 dark:text-white">{authUser?.name ?? "Carlos Bogado"}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Main POS Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Search autocomplete */}
              <div className="relative z-30 rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  🔍 BUSCADOR DE REPUESTOS <span className="text-[10px] font-semibold text-primary dark:text-indigo-400 normal-case ml-1">(F2 para enfocar)</span>
                </label>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Escriba código, nombre, marca o modelo de auto..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowSuggestions(true);
                        setFocusedSuggestionIndex(-1);
                      }}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none transition-all"
                    />
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Icon name="search" className="text-lg" />
                    </span>
                    {productSearch && (
                      <button
                        onClick={() => {
                          setProductSearch("");
                          setShowSuggestions(false);
                        }}
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <Icon name="clear" className="text-base" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleAddFirstMatch}
                    disabled={matchingProducts.length === 0}
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/10 transition hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Icon className="text-sm font-bold" name="add" />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* Suggestions overlay */}
                {showSuggestions && productSearch.trim() && (
                  <div className="absolute left-5 right-5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl mt-2 overflow-hidden">
                    {matchingProducts.length > 0 ? (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
                        {matchingProducts.map((product, idx) => (
                          <li key={product.id}>
                            <button
                              onClick={() => handleAddProductToCart(product)}
                              onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                              type="button"
                              className={`w-full px-5 py-3 text-left transition-colors flex items-center justify-between ${
                                idx === focusedSuggestionIndex
                                  ? "bg-slate-100 dark:bg-slate-800 font-bold"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-3">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                  SKU-{product.id} {product.description ? `• ${product.description}` : ""}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-black text-primary">{formatGs(Number(product.salePrice))}</p>
                                <p className={`text-[10px] font-bold ${product.stock <= 3 ? "text-rose-500 animate-pulse" : "text-slate-500"}`}>
                                  Stock: {product.stock}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-5 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                        No se encontraron repuestos compatibles.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart items list */}
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Icon name="shopping_cart" className="text-primary" />
                    <span>🛒 DETALLE DE LA VENTA ACTUAL</span>
                  </h3>
                  <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {saleItems.length} ítems
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200/65 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-850">
                        <th className="px-5 py-3.5">Código</th>
                        <th className="px-5 py-3.5">Descripción</th>
                        <th className="px-5 py-3.5">Marca / Compatibilidad</th>
                        <th className="px-5 py-3.5 w-24">Cant.</th>
                        <th className="px-5 py-3.5 text-right">Precio</th>
                        <th className="px-5 py-3.5 text-right">Total</th>
                        <th className="px-5 py-3.5 text-center w-12">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                      {saleItems.map((item, idx) => {
                        const product = productById.get(item.productId);
                        const name = product?.name ?? "Producto desconocido";
                        const sku = product ? `SKU-${product.id}` : "";
            const salePrice = product ? Number(product.salePrice) : 0;
            const quantity = Number(item.quantity) || 0;
            const subtotal = salePrice * quantity;
                        const brandInfo = extractBrand(product?.description) || "Genérico";

                        return (
                          <tr key={`${item.productId}-${idx}`} className="premium-row hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                            <td className="px-5 py-4 font-bold text-slate-400 dark:text-slate-500">{sku}</td>
                            <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white">{name}</td>
                            <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={product?.description}>
                              {brandInfo}
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateSaleItem(idx, "quantity", e.target.value)}
                                className="w-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-center font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </td>
                            <td className="px-5 py-4 text-right font-medium text-slate-650 dark:text-slate-350">{formatGs(salePrice)}</td>
                            <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-white">{formatGs(subtotal)}</td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => removeSaleItem(idx)}
                                type="button"
                                className="text-rose-500 hover:text-rose-750 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                                title="Eliminar del carrito"
                              >
                                <Icon name="close" className="text-base font-black" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {saleItems.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-5 py-14 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                            El carrito está vacío. Busque un repuesto en la barra superior para agregarlo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right POS Sidebar (Client, Payment, Totals) */}
            <div className="space-y-6">
              {/* Customer selection */}
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Icon name="person" className="text-primary text-base" />
                  <span>👤 CLIENTE</span>
                </h3>

                <div className="space-y-3 relative">
                  {/* Lookup input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="RUC/CI o Nombre..."
                        value={rucInput}
                        onChange={(e) => {
                          setRucInput(e.target.value);
                          setShowCustomerSuggestions(true);
                          setFocusedCustomerIndex(-1);
                        }}
                        onKeyDown={handleCustomerSearchKeyDown}
                        onFocus={() => setShowCustomerSuggestions(true)}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                        <Icon name="tag" className="text-sm" />
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setNewCustRuc(rucInput);
                        setShowQuickCreateCustomer(true);
                        setShowCustomerSuggestions(false);
                      }}
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-655 transition dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40 cursor-pointer"
                      title="Crear cliente rápido"
                    >
                      <Icon name="add" className="text-base" />
                    </button>
                  </div>

                  {/* Customer suggestions dropdown */}
                  {showCustomerSuggestions && rucInput.trim() && (
                    <div className="absolute left-0 right-12 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl mt-1 overflow-hidden">
                      {matchingCustomers.length > 0 ? (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-48 overflow-y-auto">
                          {matchingCustomers.map((customer, idx) => (
                            <li key={customer.id}>
                              <button
                                onClick={() => handleSelectCustomer(customer)}
                                onMouseEnter={() => setFocusedCustomerIndex(idx)}
                                type="button"
                                className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between ${
                                  idx === focusedCustomerIndex
                                    ? "bg-slate-100 dark:bg-slate-800"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                }`}
                              >
                                <div className="min-w-0 flex-1 pr-3">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{customer.name}</p>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                                    {customer.email.includes("@ruc.com")
                                      ? `RUC/CI: ${customer.email.replace("@ruc.com", "")}`
                                      : customer.email}
                                  </p>
                                </div>
                                {customer.phone && (
                                  <span className="text-[10px] text-slate-400 flex-shrink-0">{customer.phone}</span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
                            No se encontró este cliente.
                          </p>
                          <button
                            onClick={() => {
                              setNewCustRuc(rucInput);
                              setShowQuickCreateCustomer(true);
                              setShowCustomerSuggestions(false);
                            }}
                            type="button"
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                          >
                            + Registrar nuevo cliente
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Customer display */}
                  <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 p-3.5 border border-slate-200/50 dark:border-slate-800/60">
                    {activeCustomer ? (
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente Asignado:</p>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{activeCustomer.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                          <Icon name="badge" className="text-xs text-slate-400" />
                          {activeCustomer.email.includes("@ruc.com")
                            ? `RUC/CI: ${activeCustomer.email.replace("@ruc.com", "")}`
                            : `RUC/CI: ${activeCustomer.email}`}
                        </p>
                        {activeCustomer.phone && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                            <Icon name="phone" className="text-xs text-slate-400" />
                            Tel: {activeCustomer.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center py-1">
                        Ningún cliente seleccionado.
                      </p>
                    )}
                  </div>

                  {/* Quick Creation Form Panel */}
                  {showQuickCreateCustomer && (
                    <div className="rounded-2xl border border-indigo-100/60 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 p-4 space-y-3 mt-2">
                      <div className="flex justify-between items-center border-b border-indigo-100/30 pb-1.5">
                        <h4 className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Registrar Cliente Rápido</h4>
                        <button
                          type="button"
                          onClick={() => setShowQuickCreateCustomer(false)}
                          className="text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          <Icon name="close" className="text-xs" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">RUC / Cédula</span>
                          <input
                            type="text"
                            placeholder="Ej: 458741-2"
                            value={newCustRuc}
                            onChange={(e) => setNewCustRuc(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</span>
                          <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Teléfono (Opcional)</span>
                          <input
                            type="text"
                            placeholder="Ej: 0981 123 456"
                            value={newCustPhone}
                            onChange={(e) => setNewCustPhone(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Dirección (Opcional)</span>
                          <input
                            type="text"
                            placeholder="Ej: Asunción"
                            value={newCustAddress}
                            onChange={(e) => setNewCustAddress(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </label>
                        <button
                          onClick={handleCreateCustomerInline}
                          type="button"
                          disabled={inlineSubmitting}
                          className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {inlineSubmitting ? "Registrando..." : "Guardar y Asignar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md space-y-3.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Icon name="payments" className="text-primary text-base" />
                  <span>💵 RESUMEN</span>
                </h3>

                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Subtotal</span>
                    <span className="font-extrabold text-slate-750 dark:text-slate-200 text-sm">{formatGs(saleTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Descuento</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        min="0"
                        value={discountInput > 0 ? new Intl.NumberFormat('es-PY').format(discountInput) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, '');
                          setDiscountInput(raw ? parseInt(raw, 10) : 0);
                        }}
                        placeholder="0"
                        className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-right font-black text-xs text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-slate-400 font-bold">Gs.</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 flex justify-between items-baseline">
                    <span className="font-black text-slate-950 dark:text-white text-sm uppercase tracking-wider">TOTAL</span>
                    <span className="font-black text-primary text-2xl tracking-tight">
                      {formatGs(Math.max(0, saleTotal - discountInput))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment methods selectors */}
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Icon name="credit_card" className="text-primary text-base" />
                  <span>Forma de Pago</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "Efectivo", label: "Efectivo", icon: "payments" },
                    { value: "Transferencia", label: "Transferencia", icon: "account_balance" },
                    { value: "Tarjeta", label: "Tarjeta", icon: "credit_card" },
                    { value: "Billetera", label: "Billetera / Otro", icon: "phone_android" },
                  ].map((method) => {
                    const isSelected = salePaymentMethod === method.value;
                    return (
                      <button
                        key={method.value}
                        onClick={() => setSalePaymentMethod(method.value)}
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02] font-black"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                        }`}
                      >
                        <Icon name={method.icon} className={isSelected ? "text-white text-lg" : "text-slate-500 text-lg"} />
                        <span className="text-[10px] uppercase tracking-wide">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit error display */}
              {saleError && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2 border border-rose-200/50 dark:border-rose-900/30">
                  <Icon name="error" className="text-sm" />
                  <p>{saleError}</p>
                </div>
              )}

              {/* Big Confirm Sale Button */}
              <button
                onClick={handleCreateSale}
                disabled={isSaving || !saleItems.length || !salePaymentMethod}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon name="save" className="text-sm" />
                <span>💾 CONFIRMAR VENTA (F12)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial View (Recent sales table) */}
      {activeTab === "historial" && (
        <section className="grid gap-6 animate-fadeIn">
          <div className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">Ventas registradas</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Historial completo para auditoría y reimpresión.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Forma de Pago</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="premium-row text-sm hover:bg-slate-50/40 dark:hover:bg-slate-850/15">
                      <td className="px-5 py-4.5 font-extrabold text-slate-900 dark:text-white">VTA-{sale.id}</td>
                      <td className="px-5 py-4.5 font-semibold text-slate-655 dark:text-slate-350">
                        {customerById.get(sale.customerId) ??
                          parseTicketPayload(sale.notes).walkInCustomerName ??
                          (sale.customerId === 0 ? "Cliente ocasional" : `Cliente #${sale.customerId ?? "N/A"}`)}
                      </td>
                      <td className="px-5 py-4.5 text-slate-700 dark:text-slate-300 font-medium">
                        {sale.paymentMethod ?? "-"}
                      </td>
                      <td className="px-5 py-4.5 font-black text-slate-900 dark:text-white">{formatGs(Number(sale.total) || 0)}</td>
                      <td className="px-5 py-4.5 text-slate-500 dark:text-slate-450 font-medium">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("es-PY") : "-"}
                      </td>
                      <td className="px-5 py-4.5 space-x-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-sky-700 hover:scale-102 active:scale-98 shadow-sm cursor-pointer"
                          onClick={() => printTicket(sale)}
                          type="button"
                        >
                          <Icon className="text-base" name="print" />
                          Ticket
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 hover:scale-102 active:scale-98 shadow-sm cursor-pointer"
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
        </section>
      )}

      {/* Sale Registered Success Print Modal */}
      {createdSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Venta registrada</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Elige ticket o factura para finalizar la operación.</p>
              </div>
              <button
                type="button"
                onClick={closeCreatedSaleSummary}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente:</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {customerById.get(createdSale.customerId) ?? `Cliente #${createdSale.customerId}`}
                </p>
                <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forma de Pago / Total:</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {createdSale.paymentMethod ?? "No especificado"} — <span className="text-primary">{formatGs(Number(createdSale.total))}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => printTicket(createdSale)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md hover:bg-sky-700 transition cursor-pointer"
                >
                  <Icon name="print" />
                  Imprimir Ticket
                </button>
                <button
                  type="button"
                  onClick={() => printInvoice(createdSale)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Icon name="print" />
                  Imprimir Factura
                </button>
              </div>
              <button
                type="button"
                onClick={closeCreatedSaleSummary}
                className="w-full rounded-2xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-850 dark:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
