import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button";

export default function SectionForm({ departments = [], divisions = [], onSubmit }) {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [divisionId, setDivisionId] = useState("");

  const filteredDivisions = divisions.filter(
    (division) => division.department?.id === departmentId || division.departmentId === departmentId
  );

  function handleDepartmentChange(e) {
    setDepartmentId(e.target.value);
    setDivisionId("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !divisionId) return;

    await onSubmit({ name, divisionId });

    setName("");
    setDepartmentId("");
    setDivisionId("");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Section</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Parent Department</label>
            <select
              value={departmentId}
              onChange={handleDepartmentChange}
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
            <label className="block mb-2 font-medium">Parent Division</label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="">Select Division</option>
              {filteredDivisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Section Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Section name"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <div>
            <Button type="submit" variant="accent">
              Create Section
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}