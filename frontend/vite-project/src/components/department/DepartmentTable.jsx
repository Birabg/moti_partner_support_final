import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card } from "../ui/card";
import Button from "../ui/button";
// src/components/department/DepartmentTable.jsx

import { useState } from "react";
import {
  FaEdit,
  FaCheck,
  FaBan,
  FaSave,
  FaTimes,
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
        name: editingName,
      });

      cancelEdit();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Card>
      <div className="overflow-x-auto">

        <Table className="min-w-full">

          <TableHeader>

            <TableRow>

              <TableHead className="px-5 py-4 text-left">
                #
              </TableHead>

              <TableHead className="px-5 py-4 text-left">
                Department
              </TableHead>

              <TableHead className="px-5 py-4 text-center">
                Divisions
              </TableHead>

              <TableHead className="px-5 py-4 text-left">
                Manager
              </TableHead>

              <TableHead className="px-5 py-4 text-center">
                Status
              </TableHead>

              <TableHead className="px-5 py-4 text-center">
                Actions
              </TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {departments.map((department, index) => (
              <TableRow
                key={department.id}
                className="border-b hover:bg-gray-50"
              >
                <TableCell className="px-5 py-4">
                  {index + 1}
                </TableCell>

                <TableCell className="px-5 py-4">

                  {editingId === department.id ? (
                    <input
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(e.target.value)
                      }
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  ) : (
                    <span className="font-medium">
                      {department.name}
                    </span>
                  )}

                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  {department._count?.divisions ?? 0}
                </TableCell>

                <TableCell className="px-5 py-4">

                  {department.manager ? (
                    <div>

                      <div className="font-medium">
                        {department.manager.firstName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {department.manager.email}
                      </div>

                    </div>
                  ) : (
                    <span className="text-gray-400">
                      Not Assigned
                    </span>
                  )}

                </TableCell>

                <TableCell className="px-5 py-4 text-center">

                  {department.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Inactive
                    </span>
                  )}

                </TableCell>

                <TableCell className="px-5 py-4">

                  <div className="flex items-center justify-center gap-2">

                    {editingId === department.id ? (
                      <>
                        <Button onClick={() => saveEdit(department.id)} variant="accent" size="sm">
                          <FaSave />
                        </Button>

                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <FaTimes />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="relative group">
                          <Button onClick={() => startEdit(department)} variant="accent" size="sm" className="p-2">
                            <FaEdit />
                          </Button>

                          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">Edit</span>
                        </div>

                        {department.isActive ? (
                          <div className="relative group">
                            <Button onClick={() => onDeactivate(department.id)} variant="danger" size="sm" className="p-2">
                              <FaBan />
                            </Button>

                            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">Deactivate</span>
                          </div>
                        ) : (
                          <div className="relative group">
                            <Button onClick={() => onReactivate(department.id)} variant="primary" size="sm" className="p-2">
                              <FaCheck />
                            </Button>

                            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">Reactivate</span>
                          </div>
                        )}
                      </>
                    )}

                  </div>

                </TableCell>

              </TableRow>
            ))}

            {departments.length === 0 && (
              <TableRow>

                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-gray-500"
                >
                  No departments found.
                </TableCell>

              </TableRow>
            )}

          </TableBody>

        </Table>

      </div>

    </Card>
  );
}