import { useEffect, useState } from "react";

import { ReportsApi } from "../../api/reportsApi";

import DashboardHeader from "../../components/reports/DashboardHeader";
import ExportButtons from "../../components/reports/ExportButtons";
import KPISection from "../../components/reports/KPISection";
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

    useEffect(() => {
        initialize();
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

    const pieData = [
        {
            name: "Open",
            value: metrics.open,
        },
        {
            name: "In Progress",
            value: metrics.inProgress,
        },
        {
            name: "Closed",
            value: metrics.closed,
        },
    ];

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

            <KPISection
                total={metrics.total}
                open={metrics.open}
                progress={metrics.inProgress}
                closed={metrics.closed}
            />

            <div className="grid lg:grid-cols-2 gap-6">

                <StatusPieChart
                    data={pieData}
                />
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