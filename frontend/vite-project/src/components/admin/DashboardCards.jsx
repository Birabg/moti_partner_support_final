import { useEffect, useState } from "react";
import { Building2, Clock3, ClipboardList, Loader2 } from "lucide-react";
import { OrganizationApi } from "../../api/organizationApi";
import { ApprovalApi } from "../../api/approvalApi";
import { AnalyticsApi } from "../../api/analyticsApi";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function DashboardCards() {
    const [organizations, setOrganizations] = useState(0);
    const [pending, setPending] = useState(0);
    const [cases, setCases] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();

        const refresh = () => load();
        const handleCaseUpdated = () => load();

        window.addEventListener("focus", refresh);
        window.addEventListener("cases:updated", handleCaseUpdated);
        const intervalId = window.setInterval(refresh, 10000);

        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("cases:updated", handleCaseUpdated);
            window.clearInterval(intervalId);
        };
    }, []);

    const load = async () => {
        try {
            const [orgRes, pendingRes, caseRes] = await Promise.all([
                OrganizationApi.getAll(),
                ApprovalApi.getPending(),
                AnalyticsApi.getCaseSummary(),
            ]);

            const orgCount = Array.isArray(orgRes?.data?.data) ? orgRes.data.data.length : 0;
            const pendingCount = (pendingRes?.data?.data?.customers?.length || 0) + (pendingRes?.data?.data?.staff?.length || 0);
            const totalCases = caseRes?.data?.data?.total || 0;

            setOrganizations(orgCount);
            setPending(pendingCount);
            setCases(totalCases);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { title: "Organizations", value: organizations, icon: Building2 },
        { title: "Total Pending Users", value: pending, icon: Clock3 },
        { title: "Total Cases", value: cases, icon: ClipboardList },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ title, value, icon: Icon }) => (
                <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{title}</CardTitle>
                        <Icon className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" /> : value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
