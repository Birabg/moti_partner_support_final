import { useState } from "react";
import { Building2, Plus } from "lucide-react";

export default function DepartmentForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || submitting) return;

    try {
      setSubmitting(true);

      await onSubmit({
        name: trimmedName,
      });

      setName("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Create Department
            </h3>

            <p className="mt-0.5 text-xs text-slate-400">
              Add a new department to the organization structure.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="department-name"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Department Name
              </label>

              <input
                id="department-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter department name"
                disabled={submitting}
                autoComplete="off"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3.5
                  text-sm
                  font-medium
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                  transition-all duration-200
                  hover:border-slate-300
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="
                inline-flex
                h-11
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                shadow-blue-600/20
                transition-all duration-200
                hover:bg-blue-700
                hover:shadow-md
                hover:shadow-blue-600/20
                focus:outline-none
                focus:ring-4
                focus:ring-blue-500/15
                disabled:cursor-not-allowed
                disabled:bg-slate-200
                disabled:text-slate-400
                disabled:shadow-none
              "
            >
              <Plus className="h-4 w-4" />

              {submitting ? "Creating..." : "Create Department"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
