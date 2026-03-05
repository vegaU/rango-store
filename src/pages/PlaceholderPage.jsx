export default function PlaceholderPage({ title }) {
  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Seccion en construccion. Ya puedes navegar desde sidebar y barra inferior.</p>
      </div>
    </section>
  );
}
