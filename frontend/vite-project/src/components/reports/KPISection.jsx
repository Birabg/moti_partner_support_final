import { FaFolderOpen, FaClock, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function KPISection({ metrics = {} }) {
    const cards = [
        { title: "Total Cases", value: metrics.total || metrics.totalCases || 0, icon: FaFolderOpen },
        { title: "Open Cases", value: metrics.open || metrics.OPEN || 0, icon: FaClock },
        { title: "In Progress", value: metrics.inProgress || metrics.IN_PROGRESS || 0, icon: FaChartLine },
        { title: "Escalated", value: metrics.escalated || metrics.ESCALATED || 0, icon: FaChartLine },
        { title: "Resolved", value: metrics.resolved || metrics.RESOLVED || 0, icon: FaCheckCircle },
        { title: "Awaiting Customer", value: metrics.customerConfirmation || metrics.CUSTOMER_CONFIRMATION || 0, icon: FaChartLine },
        { title: "Closed Cases", value: metrics.closed || metrics.CLOSED || 0, icon: FaCheckCircle },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ title, value, icon: Icon }) => (
                <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{title}</CardTitle>
                        <Icon className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
