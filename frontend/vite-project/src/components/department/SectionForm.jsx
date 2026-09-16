import { useState } from "react";
import {
  Building2,
  GitBranch,
  Layers3,
  Plus,
} from "lucide-react";

export default function SectionForm({
  departments = [],
  divisions = [],
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [divisionId, setDivisionId] = useState("");

  const filteredDivisions = divisions.filter(
    (division) =>
      division.department?.id === departmentId ||
      division.departmentId === departmentId
  );

  function handleDepartmentChange(e) {
    setDepartmentId(e.target.value);
    setDivisionId("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !divisionId) return;

    await onSubmit({
      name: name.trim(),
      divisionId,
    });

    setName("");
    setDepartmentId("");
    setDivisionId("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Layers3 className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Create Section
            </h3>

            <p className="mt-0.5 text-xs text-slate-400">
              Add a section and connect it to its organizational hierarchy.
            </p>
          </div>

        </div>

        {/* Form */}
        <div className="p-5">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Department */}
            <div>
              <label
                htmlFor="section-department"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Parent Department
              </label>

              <div className="relative">

                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <select
                  id="section-department"
                  value={departmentId}
                  onChange={handleDepartmentChange}
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-10
                    pr-9
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

            {/* Division */}
            <div>
              <label
                htmlFor="section-division"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Parent Division
              </label>

              <div className="relative">

                <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <select
                  id="section-division"
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  disabled={!departmentId}
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-10
                    pr-9
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
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                    disabled:text-slate-400
                  "
                >
                  <option value="">
                    {departmentId
                      ? "Select division"
                      : "Select department first"}
                  </option>

                  {filteredDivisions.map((division) => (
                    <option
                      key={division.id}
                      value={division.id}
                    >
                      {division.name}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  ▼
                </span>

              </div>
            </div>

            {/* Section Name */}
            <div>
              <label
                htmlFor="section-name"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Section Name
              </label>

              <div className="relative">

                <Layers3 className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <input
                  id="section-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter section name"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-10
                    pr-3.5
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
              disabled={!name.trim() || !divisionId}
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
              Create Section
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}