import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function ManagerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await managerApi.getProfile();
        setProfile(response?.data?.data || null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <ManagerHeader user={{ firstName: "Manager", lastName: "" }} orgPath="Profile" managerRole="Manager" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Profile" value={profile?.name || "Manager"} caption="Current logged-in manager record" icon={UserCircle2} accent="blue" loading={loading} />
      </div>

      <Card>
        <CardHeader className="items-start gap-4">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-7 w-7 text-navy-500" />
            <div>
              <CardTitle>Manager Profile</CardTitle>
              <p className="text-sm text-slate-500">Use the shared profile endpoint to keep manager identity and scope in sync with the backend.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Edit profile</Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
