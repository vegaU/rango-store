import { useState } from "react";
import Icon from "./Icon";
import { formatGsInput } from "../utils/currency";

function buildFormState(fields, initialValues = {}) {
  return fields.reduce((acc, field) => {
    let val = initialValues[field.name] ?? field.defaultValue ?? "";
    if (field.type === "currency") {
      val = formatGsInput(val);
    }
    acc[field.name] = val;
    return acc;
  }, {});
}

function FormModalContent({
  title,
  onClose,
  onSubmit,
  fields,
  submitLabel,
  isLoading,
  initialValues,
}) {
  const [formData, setFormData] = useState(() =>
    buildFormState(fields, initialValues),
  );

  const handleChange = (event) => {
    let { name, value } = event.target;
    const field = fields.find((item) => item.name === name);

    if (field?.type === "currency") {
      value = formatGsInput(value);
    }

    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-full flex flex-col overflow-hidden transition-all duration-300 transform scale-100">
        <div className="flex items-center justify-between flex-shrink-0 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="flex items-center justify-center rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Icon className="text-xl" name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-1.5 pb-2 flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 focus:border-primary focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all form-input"
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all form-input"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value} className="dark:bg-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "currency" ? "text" : (field.type || "text")}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 focus:border-primary focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all form-input"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 hover:bg-primary/95 hover:shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Guardando..." : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-250 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600 transition-all active:scale-98"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FormModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  fields,
  submitLabel = "Guardar",
  isLoading = false,
  initialValues = {},
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <FormModalContent
      title={title}
      onClose={onClose}
      onSubmit={onSubmit}
      fields={fields}
      submitLabel={submitLabel}
      isLoading={isLoading}
      initialValues={initialValues}
    />
  );
}
