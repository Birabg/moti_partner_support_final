import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button";

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
      name,
      departmentId,
    });

    setName("");
    setDepartmentId("");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Division</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Parent Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="">Select Department</option>

              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Division Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Division name"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <div>
            <Button type="submit" variant="accent">
              Create Division
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}