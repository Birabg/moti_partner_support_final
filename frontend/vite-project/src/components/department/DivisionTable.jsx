import {
  Building2,
  CheckCircle2,
  GitBranch,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  XCircle,
} from "lucide-react";

export default function DivisionTable({
  divisions = [],
  departments = [],
  onUpdate,
  onDeactivate,
  onReactivate,
}) {
  function getDepartmentName(division) {
    if (division.department?.name) {
      return division.department.name;
    }

    const department = departments.find(
      (item) => item.id === division.departmentId
    );

    return department?.name || "Unassigned";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Division
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Parent Department
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {divisions.map((division) => {
              const isActive =
                division.isActive !== false &&
                division.status !== "INACTIVE";

              return (
                <tr
                  key={division.id}
                  className="group transition-colors hover:bg-slate-50/60"
                >

                  {/* Division */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <GitBranch className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {division.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Division
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* Department */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <Building2 className="h-3.5 w-3.5 text-slate-400" />

                      <span className="text-sm font-medium text-slate-600">
                        {getDepartmentName(division)}
                      </span>

                    </div>

                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactive
                      </span>
                    )}

                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">

                    <div className="flex items-center justify-end gap-2">

                      {onUpdate && (
                        <button
                          type="button"
                          onClick={() => onUpdate(division.id, {
                            name: division.name,
                            departmentId: division.departmentId,
                          })}
                          title="Edit division"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            transition
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-blue-600
                          "
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {isActive && onDeactivate && (
                        <button
                          type="button"
                          onClick={() => onDeactivate(division.id)}
                          title="Deactivate division"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            transition
                            hover:border-red-200
                            hover:bg-red-50
                            hover:text-red-600
                          "
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {!isActive && onReactivate && (
                        <button
                          type="button"
                          onClick={() => onReactivate(division.id)}
                          title="Reactivate division"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-emerald-600
                          "
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <div className="flex h-9 w-9 items-center justify-center text-slate-300">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-slate-100 md:hidden">

        {divisions.map((division) => {
          const isActive =
            division.isActive !== false &&
            division.status !== "INACTIVE";

          return (
            <div
              key={division.id}
              className="p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GitBranch className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {division.name}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Building2 className="h-3 w-3" />
                      {getDepartmentName(division)}
                    </div>

                  </div>

                </div>

                {isActive ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    Active
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                    Inactive
                  </span>
                )}

              </div>

              <div className="mt-4 flex justify-end gap-2">

                {onUpdate && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate(division.id, {
                        name: division.name,
                        departmentId: division.departmentId,
                      })
                    }
                    className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}

                {isActive && onDeactivate && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(division.id)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Deactivate
                  </button>
                )}

                {!isActive && onReactivate && (
                  <button
                    type="button"
                    onClick={() => onReactivate(division.id)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-emerald-100 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reactivate
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}
