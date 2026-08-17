import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { useEffect, useState } from "react";
import { FaBuilding } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function DirectorOrganizationSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        setLoading(true);
        const response = await directorApi.getOrganizationListAdmin();
        if (!isMounted) return;
        const organizations = response?.data?.data || [];

        setSummary({ organizations });
      } catch (caughtError) {
        // eslint-disable-next-line no-console
        console.error('Director organization summary load error', caughtError);
        const apiMessage = caughtError?.response?.data?.message || caughtError?.response?.data || caughtError?.message || String(caughtError);
        if (isMounted) setError(`Could not load organization summary: ${apiMessage}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = summary?.organizations || [];

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director"
        title="Organization Summary"
        subtitle="Overview of organization performance and case activity"
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex items-center gap-2">
          <FaBuilding className="h-5 w-5 text-navy-600" />
          <CardTitle>Organization list</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading organization summary…</p>
          ) : rows.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No organization summary data found.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <Table className="min-w-full divide-y divide-slate-200 text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Organization</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Status</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Customers</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200">
                  {rows.slice(0, 12).map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="px-4 py-3 text-slate-900">{org.name || org.code || "Organization"}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{org.isActive ? "Active" : "Inactive"}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{org._count?.customers ?? 0}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
