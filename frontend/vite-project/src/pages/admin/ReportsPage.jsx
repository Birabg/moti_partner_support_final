import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";

import { ReportsApi } from "../../api/reportsApi";

import DashboardHeader from "../../components/reports/DashboardHeader";
import ExportButtons from "../../components/reports/ExportButtons";
import StatusPieChart from "../../components/reports/StatusPieChart";
import MonthlyTrendChart from "../../components/reports/MonthlyTrendChart";
import FeedbackSummary from "../../components/reports/FeedbackSummary";
import RecentCasesTable from "../../components/reports/RecentCasesTable";
import LoadingReports from "../../components/reports/LoadingReports";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);

    const [metrics, setMetrics] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        closed: 0,
    });

    const [feedback, setFeedback] = useState({
        summary: {
            averageSatisfactionScore: 0,
            feedbackSubmissionRatePercentage: 0,
            casesWithFeedbackReceived: 0,
        },
        reviews: [],
    });

    const [cases, setCases] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        initialize();

        // Listen for case updates and refresh reports
        const handleCasesUpdated = () => {
            initialize();
        };

        window.addEventListener("cases:updated", handleCasesUpdated);

        return () => {
            window.removeEventListener("cases:updated", handleCasesUpdated);
        };
    }, []);

    async function initialize() {
        try {
            setLoading(true);

            const [
                metricsResponse,
                feedbackResponse,
                casesResponse,
            ] = await Promise.all([
                ReportsApi.getMetrics(),
                ReportsApi.getFeedback(),
                ReportsApi.getCases(),
            ]);

            setMetrics(metricsResponse.data.data);

            setFeedback(feedbackResponse.data.data);

            setCases(casesResponse.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // Build pie chart data from actual cases so all statuses are reflected
    const defaultOrder = [
        "Open",
        "In Progress",
        "Pending",
        "Escalated",
        "Awaiting Customer",
        "Resolved",
        "Closed",
    ];

    const statusLabel = (raw) => {
        if (!raw) return "Open";
        const s = String(raw).toUpperCase().trim();

        if (s === "OPEN") return "Open";
        if (s === "IN_PROGRESS" || s === "INPROGRESS") return "In Progress";
        if (s === "PENDING" || s === "PENDING_CUSTOMER") return "Pending";
        if (s === "ESCALATED") return "Escalated";
        if (s === "WAITING_CUSTOMER_FEEDBACK" || s === "AWAITING_CUSTOMER" || s === "AWAITING_CUSTOMER_FEEDBACK") return "Awaiting Customer";
        if (s === "RESOLVED") return "Resolved";
        if (s === "CLOSED") return "Closed";

        // Fallback to the raw string with capitalization
        return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    };

    const counts = defaultOrder.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

    cases.forEach((c) => {
        const raw = c?.lifecycle?.status || c?.status;
        const label = statusLabel(raw);
        if (counts[label] === undefined) counts[label] = 0;
        counts[label]++;
    });

    const pieData = defaultOrder.map((name) => ({ name, value: counts[name] || 0 }));

    const monthly = {};

    cases.forEach((item) => {
        const date = new Date(
            item.lifecycle.createdAt
        );

        const month = date.toLocaleString("default", {
            month: "short",
        });

        if (!monthly[month]) {
            monthly[month] = 0;
        }

        monthly[month]++;
    });

    const monthlyData = Object.keys(monthly).map(
        (month) => ({
            month,
            cases: monthly[month],
        })
    );

    if (loading) {
        return <LoadingReports />;
    }

    return (
        <div className="space-y-8">

            <DashboardHeader />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white p-4 shadow-sm">
                <ExportButtons />
            </div>


            <div className="grid lg:grid-cols-2 gap-6">
                <StatusPieChart data={pieData} />
            </div>
            <div><MonthlyTrendChart
                    data={monthlyData}
                /></div>

           

            <FeedbackSummary
                summary={feedback.summary}
            />

            <RecentCasesTable
                cases={cases}
            />

        </div>
    );
}