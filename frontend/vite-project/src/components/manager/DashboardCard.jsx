import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function DashboardCard({ title, value, caption, icon: Icon, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">
          {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" /> : value}
        </div>
        {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}
