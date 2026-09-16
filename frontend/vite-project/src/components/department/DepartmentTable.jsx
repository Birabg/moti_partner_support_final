import { useState } from "react";
import {
  FaEdit,
  FaCheck,
  FaBan,
  FaSave,
  FaTimes,
  FaBuilding,
  FaLayerGroup,
} from "react-icons/fa";

export default function DepartmentTable({
  departments = [],
  onUpdate,
  onDeactivate,
  onReactivate,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  function startEdit(department) {
    setEditingId(department.id);
    setEditingName(department.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(id) {
    if (!editingName.trim()) return;

    try {
      await onUpdate(id, {
        name: editingName.trim(),
      });

      cancelEdit();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          {/* Header */}
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
                Department
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
                Divisions
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
                Manager
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

          {/* Body */}
          <tbody>

            {departments.map((department, index) => {

              const isEditing = editingId === department.id;

              return (
                <tr
                  key={department.id}
                  className="
                    group
                    border-b
                    border-slate-100
                    last:border-b-0
                    transition-colors duration-150
                    hover:bg-slate-50/60
                  "
                >

                  {/* Number */}
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

                  {/* Department */}
                  <td className="px-5 py-4">

                    {isEditing ? (
                      <div className="max-w-[280px]">

                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEdit(department.id);
                            }

                            if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                          className="
                            h-10
                            w-full
                            rounded-lg
                            border border-blue-300
                            bg-white
                            px-3
                            text-sm
                            font-medium
                            text-slate-800
                            outline-none
                            ring-4
                            ring-blue-500/10
                          "
                        />

                      </div>
                    ) : (
                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                          "
                        >
                          <FaBuilding className="text-xs" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {department.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Organizational department
                          </p>

                        </div>

                      </div>
                    )}

                  </td>

                  {/* Divisions */}
                  <td className="px-5 py-4 text-center">

                    <span
                      className="
                        inline-flex
                        min-w-8
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
                      <FaLayerGroup className="text-[9px] text-slate-400" />

                      {department._count?.divisions ?? 0}
                    </span>

                  </td>

                  {/* Manager */}
                  <td className="px-5 py-4">

                    {department.manager ? (
                      <div className="flex items-center gap-2.5">

                        <div
                          className="
                            flex
                            h-8 w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-100
                            text-[10px]
                            font-bold
                            text-slate-600
                          "
                        >
                          {department.manager.firstName
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-slate-700">
                            {department.manager.firstName}
                          </p>

                          <p className="truncate text-[11px] text-slate-400">
                            {department.manager.email}
                          </p>

                        </div>

                      </div>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-xs
                          font-medium
                          text-slate-400
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        Not assigned
                      </span>
                    )}

                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 text-center">

                    {department.isActive ? (
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
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                    )}

                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">

                    <div className="flex items-center justify-center gap-1.5">

                      {isEditing ? (
                        <>
                          {/* Save */}
                          <button
                            type="button"
                            onClick={() =>
                              saveEdit(department.id)
                            }
                            disabled={!editingName.trim()}
                            title="Save changes"
                            className="
                              flex
                              h-8 w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-600
                              text-white
                              shadow-sm
                              transition-all duration-150
                              hover:bg-blue-700
                              disabled:cursor-not-allowed
                              disabled:bg-slate-200
                              disabled:text-slate-400
                            "
                          >
                            <FaSave className="text-[11px]" />
                          </button>

                          {/* Cancel */}
                          <button
                            type="button"
                            onClick={cancelEdit}
                            title="Cancel"
                            className="
                              flex
                              h-8 w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition-all duration-150
                              hover:border-slate-300
                              hover:bg-slate-50
                              hover:text-slate-600
                            "
                          >
                            <FaTimes className="text-[11px]" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(department)
                            }
                            title="Edit department"
                            className="
                              flex
                              h-8 w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition-all duration-150
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <FaEdit className="text-[11px]" />
                          </button>

                          {/* Deactivate / Reactivate */}
                          {department.isActive ? (
                            <button
                              type="button"
                              onClick={() =>
                                onDeactivate(department.id)
                              }
                              title="Deactivate department"
                              className="
                                flex
                                h-8 w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-400
                                transition-all duration-150
                                hover:border-rose-200
                                hover:bg-rose-50
                                hover:text-rose-600
                              "
                            >
                              <FaBan className="text-[11px]" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onReactivate(department.id)
                              }
                              title="Reactivate department"
                              className="
                                flex
                                h-8 w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-400
                                transition-all duration-150
                                hover:border-emerald-200
                                hover:bg-emerald-50
                                hover:text-emerald-600
                              "
                            >
                              <FaCheck className="text-[11px]" />
                            </button>
                          )}
                        </>
                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

            {/* Empty */}
            {departments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-14 text-center"
                >
                  <div className="flex flex-col items-center">

                    <div
                      className="
                        flex
                        h-11 w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <FaBuilding className="text-sm" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No departments found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a department or adjust your search.
                    </p>

                  </div>
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}