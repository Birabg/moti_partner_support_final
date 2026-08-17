import { useEffect, useState } from "react";
import { FaSitemap, FaBuilding } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function DirectorOrganizationStructure() {
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStructure() {
      try {
        setLoading(true);
        setError("");

        const [deptResp, divResp, secResp] = await directorApi.getOrganizationStructure();
        if (!isMounted) return;
        setDepartments(deptResp?.data?.data?.departments || deptResp?.data?.departments || []);
        setDivisions(divResp?.data?.data?.divisions || divResp?.data?.divisions || []);
        setSections(secResp?.data?.data?.sections || secResp?.data?.sections || []);
      } catch (caughtError) {
        console.error(caughtError);
        if (isMounted) setError("Could not load organization structure.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStructure();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director"
        title="Department Management"
        subtitle="Department, division, and section hierarchy"
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FaBuilding className="h-5 w-5 text-navy-600" />
              <CardTitle>Departments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Loading departments…</p>
              ) : departments.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No departments available.</p>
              ) : (
                departments.slice(0, 6).map((dept) => (
                  <div key={dept.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{dept.name || dept.departmentName || "Department"}</p>
                    <p className="text-sm text-slate-500">{dept.isActive === false ? "Inactive" : "Active"}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FaSitemap className="h-5 w-5 text-navy-600" />
              <CardTitle>Divisions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Loading divisions…</p>
              ) : divisions.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No divisions available.</p>
              ) : (
                divisions.slice(0, 6).map((division) => (
                  <div key={division.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{division.name || division.divisionName || "Division"}</p>
                    <p className="text-sm text-slate-500">{division.isActive === false ? "Inactive" : "Active"}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Loading sections…</p>
            ) : sections.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No sections available.</p>
            ) : (
              sections.slice(0, 8).map((section) => (
                <div key={section.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{section.name || section.sectionName || "Section"}</p>
                  <p className="text-sm text-slate-500">{section.isActive === false ? "Inactive" : "Active"}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
