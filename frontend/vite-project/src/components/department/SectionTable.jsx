import { useMemo, useState } from "react";

import {
  Pencil,
  Check,
  Ban,
  Save,
  X,
  Layers3,
  Building2,
  GitBranch,
  Users,
} from "lucide-react";
import {
  isStructureActive,
  TABLE_PAGE_SIZE,
} from "./StructureTableUtils";
import { Pagination, Toolbar } from "./StructureTableKit";

export default function SectionTable({
  sections = [],
  onUpdate,
  onDeactivate,
  onReactivate,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return sections.filter((section) => {
      if (statusFilter === "ALL") return true;
      return statusFilter === "ACTIVE" ? isStructureActive(section) : !isStructureActive(section);
    });
  }, [sections, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const startIndex = currentPage * TABLE_PAGE_SIZE;
  const pageRows = filtered.slice(startIndex, startIndex + TABLE_PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + TABLE_PAGE_SIZE, filtered.length);

  const changeStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setPage(0);
  };

  function startEdit(section) {
    setEditingId(section.id);
    setEditingName(section.name || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(id) {
    const trimmedName = editingName.trim();

    if (!trimmedName) return;

    try {
      await onUpdate(id, {
        name: trimmedName,
      });

      cancelEdit();
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <Toolbar
        total={sections.length}
        filtered={filtered.length}
        status={statusFilter}
        onStatusChange={changeStatusFilter}
        onClear={clearFilters}
        hasExtraFilters={statusFilter !== "ALL"}
        noun="section"
      />

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-[1050px] w-full">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">

              <th
                className="
                  w-16
                  px-5 py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                #
              </th>

              <th
                className="
                  px-5 py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Section
              </th>

              <th
                className="
                  px-5 py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Department
              </th>

              <th
                className="
                  px-5 py-3.5
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Division
              </th>

              <th
                className="
                  w-28
                  px-5 py-3.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Staff
              </th>

              <th
                className="
                  w-32
                  px-5 py-3.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Status
              </th>

              <th
                className="
                  w-32
                  px-5 py-3.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Actions
              </th>

            </tr>
          </thead>

          {/* =====================================================
              BODY
          ===================================================== */}

          <tbody>

            {pageRows.map((section, index) => {
              const isEditing = editingId === section.id;

              const departmentName =
                section.division?.department?.name ||
                section.department?.name ||
                "Not assigned";

              const divisionName =
                section.division?.name ||
                "Not assigned";

              const staffCount =
                section._count?.staff ??
                section.staffCount ??
                0;

              return (
                <tr
                  key={section.id}
                  className="
                    group
                    border-b
                    border-slate-100
                    last:border-b-0
                    transition-colors
                    duration-150
                    hover:bg-slate-50/60
                  "
                >

                  {/* =================================================
                      NUMBER
                  ================================================= */}

                  <td className="px-5 py-4">

                    <span
                      className="
                        text-xs
                        font-medium
                        tabular-nums
                        text-slate-400
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                  </td>

                  {/* =================================================
                      SECTION
                  ================================================= */}

                  <td className="px-5 py-4">

                    {isEditing ? (

                      <div className="max-w-[280px]">

                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEdit(section.id);
                            }

                            if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                          className="
                            h-10
                            w-full
                            rounded-lg
                            border
                            border-blue-300
                            bg-white
                            px-3
                            text-sm
                            font-medium
                            text-slate-800
                            outline-none
                            ring-4
                            ring-blue-500/10
                            transition-all
                            duration-150
                            focus:border-blue-500
                          "
                        />

                      </div>

                    ) : (

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                          "
                        >
                          <Layers3 className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {section.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Organizational section
                          </p>

                        </div>

                      </div>

                    )}

                  </td>

                  {/* =================================================
                      DEPARTMENT
                  ================================================= */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2.5">

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                        "
                      >
                        <Building2 className="h-3.5 w-3.5" />
                      </div>

                      <span
                        className={`
                          truncate
                          text-sm
                          font-medium
                          ${
                            departmentName === "Not assigned"
                              ? "text-slate-400"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {departmentName}
                      </span>

                    </div>

                  </td>

                  {/* =================================================
                      DIVISION
                  ================================================= */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2.5">

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                        "
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                      </div>

                      <span
                        className={`
                          truncate
                          text-sm
                          font-medium
                          ${
                            divisionName === "Not assigned"
                              ? "text-slate-400"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {divisionName}
                      </span>

                    </div>

                  </td>

                  {/* =================================================
                      STAFF
                  ================================================= */}

                  <td className="px-5 py-4 text-center">

                    <span
                      className="
                        inline-flex
                        min-w-9
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        bg-slate-100
                        px-2.5
                        py-1.5
                        text-xs
                        font-semibold
                        text-slate-600
                      "
                    >
                      <Users className="h-3 w-3 text-slate-400" />

                      {staffCount}
                    </span>

                  </td>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <td className="px-5 py-4 text-center">

                    {section.isActive ? (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-emerald-50
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          text-emerald-700
                        "
                      >
                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-500
                          "
                        />

                        Active
                      </span>

                    ) : (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-rose-50
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          text-rose-600
                        "
                      >
                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-rose-500
                          "
                        />

                        Inactive
                      </span>

                    )}

                  </td>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <td className="px-5 py-4">

                    <div className="flex items-center justify-center gap-1.5">

                      {isEditing ? (

                        <>
                          {/* SAVE */}

                          <button
                            type="button"
                            onClick={() => saveEdit(section.id)}
                            disabled={!editingName.trim()}
                            title="Save changes"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-600
                              text-white
                              shadow-sm
                              transition-all
                              duration-150
                              hover:bg-blue-700
                              hover:shadow-md
                              disabled:cursor-not-allowed
                              disabled:bg-slate-200
                              disabled:text-slate-400
                            "
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>

                          {/* CANCEL */}

                          <button
                            type="button"
                            onClick={cancelEdit}
                            title="Cancel"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition-all
                              duration-150
                              hover:border-slate-300
                              hover:bg-slate-50
                              hover:text-slate-600
                            "
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>

                      ) : (

                        <>
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => startEdit(section)}
                            title="Edit section"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition-all
                              duration-150
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* DEACTIVATE / REACTIVATE */}

                          {section.isActive ? (

                            <button
                              type="button"
                              onClick={() =>
                                onDeactivate(section.id)
                              }
                              title="Deactivate section"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-400
                                transition-all
                                duration-150
                                hover:border-rose-200
                                hover:bg-rose-50
                                hover:text-rose-600
                              "
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                onReactivate(section.id)
                              }
                              title="Reactivate section"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-400
                                transition-all
                                duration-150
                                hover:border-emerald-200
                                hover:bg-emerald-50
                                hover:text-emerald-600
                              "
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>

                          )}

                        </>

                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {pageRows.length === 0 && (

              <tr>

                <td
                  colSpan={7}
                  className="px-5 py-14 text-center"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <Layers3 className="h-5 w-5" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No sections found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a section or adjust your search.
                    </p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {filtered.length > 0 && (
        <Pagination
          start={rangeStart}
          end={rangeEnd}
          total={filtered.length}
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          noun="section"
        />
      )}

    </div>
  );
}
