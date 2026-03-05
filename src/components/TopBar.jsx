import Icon from "./Icon";

export default function TopBar({ onOpenSidebar }) {
  const formattedDate = new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/85 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white lg:hidden">
          <Icon name="settings_input_component" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight lg:text-2xl">Panel de Control</h2>
          <p className="text-xs capitalize text-slate-500 lg:text-sm">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-4 hidden items-center rounded-lg border border-slate-200 bg-background-light px-3 py-2 dark:border-slate-700 dark:bg-slate-800 lg:flex">
          <Icon name="search" className="mr-2 text-slate-500" />
          <input className="w-64 border-none bg-transparent text-sm focus:ring-0" placeholder="Buscar repuesto..." type="text" />
        </div>

        <button className="flex size-10 items-center justify-center rounded-full text-[#111318] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
          <Icon name="notifications" />
        </button>

        {onOpenSidebar && (
          <button
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={onOpenSidebar}
            type="button"
          >
            <Icon name="menu" />
          </button>
        )}
      </div>
    </header>
  );
}
