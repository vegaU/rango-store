import Icon from "./Icon";

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading = false, isDangerous = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className={`flex size-12 items-center justify-center rounded-full ${isDangerous ? "bg-rose-100 dark:bg-rose-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
            <Icon className={isDangerous ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"} name={isDangerous ? "delete" : "warning"} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${isDangerous ? "bg-rose-600 hover:bg-rose-700" : "bg-primary hover:bg-primary/90"}`}
          >
            {isLoading ? "Procesando..." : isDangerous ? "Eliminar" : "Confirmar"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
