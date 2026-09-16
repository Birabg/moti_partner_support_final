import { useState } from "react";
import {
  Building2,
  GitBranch,
  Plus,
} from "lucide-react";

export default function DivisionForm({
  departments = [],
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !departmentId) return;

    await onSubmit({
      name: name.trim(),
      departmentId,
    });

    setName("");
    setDepartmentId("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <GitBranch className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Create Division
            </h3>

            <p className="mt-0.5 text-xs text-slate-400">
              Add a division and assign it to a parent department.
            </p>
          </div>

        </div>

        {/* Form body */}
        <div className="p-5">

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* Parent Department */}
            <div>
              <label
                htmlFor="division-department"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Parent Department
              </label>

              <div className="relative">

                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <select
                  id="division-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-10
                    pr-10
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                    transition-all
                    duration-200
                    hover:border-slate-300
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  ▼
                </span>

              </div>
            </div>

            {/* Division Name */}
            <div>
              <label
                htmlFor="division-name"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Division Name
              </label>

              <div className="relative">

                <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <input
                  id="division-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter division name"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-10
                    text-sm
                    font-medium
                    text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    shadow-[0_1px_2px_rgba(15,23,42,0.02)]
                    transition-all
                    duration-200
                    hover:border-slate-300
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />

              </div>
            </div>

          </div>

          {/* Action */}
          <div className="mt-5 flex justify-end">

            <button
              type="submit"
              disabled={!name.trim() || !departmentId}
              className="
                inline-flex
                h-11
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
                transition-all
                duration-200
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
              <Plus className="h-3.5 w-3.5" />
              Create Division
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}