import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function DirectorUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        const response = await directorApi.getUsersOverview();
        if (!isMounted) return;
        const list = response?.data?.data || [];
        const count = response?.data?.count ?? list.length;
        setUsers(list.slice(0, 12));
        setTotalUsers(count);
      } catch (caughtError) {
        console.error(caughtError);
        if (isMounted) setError("Could not load director user overview.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director"
        title="Users"
        subtitle="Active user overview across the system"
        showActions={false}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Total Active Users</CardTitle>
          </div>
          <FaUsers className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{loading ? "—" : totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading users…</p>
          ) : error ? (
            <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
          ) : users.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No users were found.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <Table className="min-w-full divide-y divide-slate-200 text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Name</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Email</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Type</TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-slate-600">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-4 py-3 text-slate-900">{`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{user.email}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{user.userType || "STAFF"}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{user.roleInfo?.isDirector ? "Director" : user.roleInfo?.isManager ? "Manager" : user.roleInfo?.isPSsupport ? "Support" : "Customer"}</TableCell>
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
