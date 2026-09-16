import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    MessageSquare,
    RefreshCw,
    Star,
    ThumbsUp,
    TrendingUp,
} from "lucide-react";

import SupportApi from "../../api/supportApi";
import FeedbackBarChart from "../../components/support/Charts/FeedbackBarChart";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/card";

export default function FeedbackAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    /*
    ============================================================
    GET STAFF ID FROM JWT
    ============================================================
    */

    const getStaffIdFromToken = useCallback(() => {
        try {
            const token =
                localStorage.getItem("jwt_token") ||
                sessionStorage.getItem("jwt_token");

            if (!token) return null;

            const parts = token.split(".");

            if (parts.length < 2) return null;

            const normalized = parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const payload = JSON.parse(atob(normalized));

            return (
                payload?.userId ||
                payload?.id ||
                payload?.sub ||
                null
            );
        } catch (error) {
            console.debug(
                "Unable to derive staff ID from authentication token:",
                error
            );

            return null;
        }
    }, []);

    /*
    ============================================================
    LOAD ANALYTICS
    ============================================================
    */

    const loadAnalytics = useCallback(
        async (showRefreshState = false) => {
            try {
                if (showRefreshState) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const staffId = getStaffIdFromToken();

                const response =
                    await SupportApi.getFeedbackAnalytics(staffId);

                setAnalytics(response?.data?.data || {});
            } catch (error) {
                console.error(
                    "Failed to load feedback analytics:",
                    error
                );

                setAnalytics({});
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [getStaffIdFromToken]
    );

    /*
    ============================================================
    INITIAL LOAD
    ============================================================
    */

    useEffect(() => {
        loadAnalytics();

        const handleCasesUpdated = () => {
            loadAnalytics(true);
        };

        window.addEventListener(
            "cases:updated",
            handleCasesUpdated
        );

        return () => {
            window.removeEventListener(
                "cases:updated",
                handleCasesUpdated
            );
        };
    }, [loadAnalytics]);

    /*
    ============================================================
    NORMALIZED DATA
    ============================================================
    */

    const summary = analytics?.summary || {};

    const totalFeedback = Number(
        summary?.casesWithFeedbackReceived ??
            summary?.totalReviewsCount ??
            0
    );

    const averageRating =
        summary?.averageSatisfactionScore ??
        summary?.averageRating ??
        null;

    const numericAverage =
        averageRating !== null &&
        averageRating !== undefined &&
        averageRating !== "—"
            ? Number(averageRating)
            : null;

    const ratingDistribution =
        analytics?.ratingDistribution || {};

    const positiveFeedbackCount =
        Number(ratingDistribution["5_star"] || 0) +
        Number(ratingDistribution["4_star"] || 0);

    const positiveRate =
        totalFeedback > 0
            ? Math.round(
                  (positiveFeedbackCount / totalFeedback) * 100
              )
            : null;

    const reviewedCases =
        summary?.casesWithFeedbackReceived ??
        summary?.totalReviewsCount ??
        totalFeedback;

    /*
    ============================================================
    RATING DISTRIBUTION
    ============================================================
    */

    const ratingRows = [
        {
            label: "5 stars",
            key: "5_star",
            value: Number(
                ratingDistribution["5_star"] || 0
            ),
        },
        {
            label: "4 stars",
            key: "4_star",
            value: Number(
                ratingDistribution["4_star"] || 0
            ),
        },
        {
            label: "3 stars",
            key: "3_star",
            value: Number(
                ratingDistribution["3_star"] || 0
            ),
        },
        {
            label: "2 stars",
            key: "2_star",
            value: Number(
                ratingDistribution["2_star"] || 0
            ),
        },
        {
            label: "1 star",
            key: "1_star",
            value: Number(
                ratingDistribution["1_star"] || 0
            ),
        },
    ];

    const hasChartData = ratingRows.some(
        (item) => item.value > 0
    );

    /*
    ============================================================
    RECENT FEEDBACK
    ============================================================
    */

    const recentFeedback = useMemo(() => {
        const items =
            analytics?.reviews ||
            analytics?.reviewsFeed ||
            [];

        if (!Array.isArray(items)) {
            return [];
        }

        return items.slice(0, 6);
    }, [analytics]);

    /*
    ============================================================
    HELPERS
    ============================================================
    */

    const getRating = (item) => {
        const value =
            item?.rating ??
            item?.satisfactionScore ??
            0;

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : 0;
    };

    const getCaseNumber = (item) =>
        item?.caseNumber ||
        item?.caseReportNumber ||
        item?.caseNumberDisplay ||
        item?.caseId ||
        item?.caseReport?.caseNumber ||
        "—";

    const getComment = (item) =>
        item?.comment ||
        item?.feedbackComment ||
        "No additional comments provided.";

    const getDate = (item) => {
        const date =
            item?.closedAt ||
            item?.submittedAt ||
            item?.createdAt;

        if (!date) {
            return "Date unavailable";
        }

        try {
            return new Date(date).toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return "Date unavailable";
        }
    };

    const getCustomerName = (item) => {
        if (item?.customerName) {
            return item.customerName;
        }

        if (item?.customer) {
            const first =
                item.customer.firstName ||
                item.customer.first_name ||
                "";

            const last =
                item.customer.lastName ||
                item.customer.last_name ||
                "";

            const fullName =
                `${first} ${last}`.trim();

            if (fullName) {
                return fullName;
            }
        }

        return "Customer";
    };

    /*
    ============================================================
    STAR DISPLAY
    ============================================================
    */

    const renderStars = (
        rating,
        size = "h-4 w-4"
    ) => {
        const rounded = Math.round(
            Number(rating) || 0
        );

        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map(
                    (_, index) => (
                        <Star
                            key={index}
                            className={`${size} ${
                                index < rounded
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                            }`}
                        />
                    )
                )}
            </div>
        );
    };

    /*
    ============================================================
    PAGE
    ============================================================
    */

    return (
        <div className="space-y-7">

            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="rounded-[24px] border border-slate-200/80 bg-white px-6 py-7 shadow-[0_8px_30px_rgba(16,32,55,0.045)] sm:px-8">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-[#527eb9]" />

                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#527eb9]">
                                Customer Experience
                            </p>

                        </div>

                        <h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#101a28] sm:text-3xl">
                            Feedback Analytics
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Track customer satisfaction,
                            understand feedback trends, and
                            monitor how customers are evaluating
                            your completed support cases.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadAnalytics(true)
                        }
                        disabled={refreshing}
                        className="
                            inline-flex h-10 shrink-0
                            items-center justify-center
                            gap-2 rounded-xl
                            border border-slate-200
                            bg-white px-4
                            text-xs font-semibold
                            text-slate-600
                            shadow-sm
                            transition-all
                            hover:border-slate-300
                            hover:bg-slate-50
                            hover:text-slate-900
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >

                        <RefreshCw
                            className={`h-3.5 w-3.5 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>

            </section>

            {/* ==================================================
                METRICS
            ================================================== */}

            <section>

                <div className="mb-4">

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Performance overview
                    </p>

                    <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                        Your feedback performance
                    </h2>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <FeedbackMetric
                        label="Average Rating"
                        value={
                            numericAverage !== null
                                ? numericAverage.toFixed(1)
                                : "—"
                        }
                        suffix="/ 5.0"
                        description="Customer satisfaction score"
                        icon={Star}
                        tone="gold"
                        loading={loading}
                    />

                    <FeedbackMetric
                        label="Feedback Received"
                        value={totalFeedback}
                        description="Customer responses"
                        icon={MessageSquare}
                        tone="blue"
                        loading={loading}
                    />

                    <FeedbackMetric
                        label="Positive Feedback"
                        value={
                            positiveRate !== null
                                ? `${positiveRate}%`
                                : "—"
                        }
                        description="4 and 5 star ratings"
                        icon={ThumbsUp}
                        tone="green"
                        loading={loading}
                    />

                    <FeedbackMetric
                        label="Reviewed Cases"
                        value={reviewedCases}
                        description="Cases with responses"
                        icon={ClipboardList}
                        tone="slate"
                        loading={loading}
                    />

                </div>

            </section>

            {/* ==================================================
                SATISFACTION OVERVIEW
            ================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

                    {/* SCORE */}

                    <div className="relative overflow-hidden bg-[#0b1d38] p-7 sm:p-8">

                        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.035]" />

                        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/[0.02]" />

                        <div className="relative">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">

                                    <Star className="h-4 w-4 text-amber-400" />

                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/40">
                                        Satisfaction
                                    </p>

                                    <p className="mt-0.5 text-xs font-semibold text-white/80">
                                        Customer rating
                                    </p>

                                </div>

                            </div>

                            <div className="mt-8 flex items-end gap-3">

                                <span className="text-6xl font-bold tracking-[-0.06em] text-white">

                                    {loading
                                        ? "—"
                                        : numericAverage !== null
                                        ? numericAverage.toFixed(
                                              1
                                          )
                                        : "—"}

                                </span>

                                <span className="mb-2 text-sm text-white/35">
                                    / 5.0
                                </span>

                            </div>

                            <div className="mt-4">
                                {renderStars(
                                    numericAverage || 0
                                )}
                            </div>

                            <p className="mt-6 max-w-md text-xs leading-6 text-white/40">
                                Your average customer
                                satisfaction score based on
                                feedback received from
                                completed support cases.
                            </p>

                        </div>

                    </div>

                    {/* SNAPSHOT */}

                    <div className="p-7 sm:p-8">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">
                                    Performance snapshot
                                </p>

                                <h3 className="mt-1.5 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                                    Feedback at a glance
                                </h3>

                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">

                                <TrendingUp className="h-4 w-4" />

                            </div>

                        </div>

                        <div className="mt-6 divide-y divide-slate-100">

                            <SnapshotRow
                                label="Feedback received"
                                description="Customer responses"
                                value={
                                    loading
                                        ? "—"
                                        : totalFeedback
                                }
                                icon={MessageSquare}
                            />

                            <SnapshotRow
                                label="Positive feedback"
                                description="4 and 5 star ratings"
                                value={
                                    loading
                                        ? "—"
                                        : positiveRate !== null
                                        ? `${positiveRate}%`
                                        : "—"
                                }
                                icon={ThumbsUp}
                            />

                            <SnapshotRow
                                label="Reviewed cases"
                                description="Cases with responses"
                                value={
                                    loading
                                        ? "—"
                                        : reviewedCases
                                }
                                icon={ClipboardList}
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* ==================================================
                RATING DISTRIBUTION
            ================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">

                                <BarChart3 className="h-5 w-5" />

                            </div>

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#527eb9]">
                                    Customer Ratings
                                </p>

                                <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                                    Rating Distribution
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    See how customer responses
                                    are distributed across
                                    each rating.
                                </p>

                            </div>

                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                            {loading
                                ? "Loading..."
                                : `${totalFeedback} responses`}
                        </span>

                    </div>

                </div>

                <div className="p-6 sm:p-7">

                    {loading ? (

                        <div className="space-y-5">

                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse"
                                    >
                                        <div className="mb-2 h-3 w-16 rounded bg-slate-100" />

                                        <div className="h-2.5 rounded-full bg-slate-100" />
                                    </div>
                                )
                            )}

                        </div>

                    ) : hasChartData ? (

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">

                            <div className="min-w-0">
                                <FeedbackBarChart
                                    data={{
                                        ratingDistribution,
                                    }}
                                />
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-5">

                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Breakdown
                                </p>

                                <div className="mt-5 space-y-4">

                                    {ratingRows.map(
                                        (row) => {
                                            const percentage =
                                                totalFeedback >
                                                0
                                                    ? Math.round(
                                                          (row.value /
                                                              totalFeedback) *
                                                              100
                                                      )
                                                    : 0;

                                            return (
                                                <div
                                                    key={
                                                        row.key
                                                    }
                                                >

                                                    <div className="mb-2 flex items-center justify-between">

                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {
                                                                row.label
                                                            }
                                                        </span>

                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {
                                                                row.value
                                                            }
                                                        </span>

                                                    </div>

                                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">

                                                        <div
                                                            className="h-full rounded-full bg-[#527eb9] transition-all duration-700"
                                                            style={{
                                                                width: `${
                                                                    totalFeedback >
                                                                    0
                                                                        ? Math.max(
                                                                              percentage,
                                                                              row.value >
                                                                                  0
                                                                                  ? 4
                                                                                  : 0
                                                                          )
                                                                        : 0
                                                                }%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                        </div>

                    ) : (

                        <EmptyState
                            icon={BarChart3}
                            title="No feedback data yet"
                            description="Once customers submit responses to your completed support cases, the rating distribution will appear here."
                        />

                    )}

                </div>

            </section>

            {/* ==================================================
                RECENT FEEDBACK
            ================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf8f4] text-[#37876c]">

                                <MessageSquare className="h-5 w-5" />

                            </div>

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#37876c]">
                                    Customer Voice
                                </p>

                                <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                                    Recent Feedback
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Latest responses from your
                                    completed support cases.
                                </p>

                            </div>

                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                            {recentFeedback.length} recent
                        </span>

                    </div>

                </div>

                {loading ? (

                    <div className="space-y-4 p-6">

                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-slate-100 p-5"
                                >
                                    <div className="h-4 w-32 rounded bg-slate-100" />

                                    <div className="mt-3 h-3 w-24 rounded bg-slate-100" />

                                    <div className="mt-4 h-12 rounded bg-slate-100" />
                                </div>
                            )
                        )}

                    </div>

                ) : recentFeedback.length === 0 ? (

                    <div className="p-6">

                        <EmptyState
                            icon={MessageSquare}
                            title="No recent feedback"
                            description="Customer responses for your completed cases will appear here."
                        />

                    </div>

                ) : (

                    <div className="divide-y divide-slate-100">

                        {recentFeedback.map(
                            (item, index) => {
                                const rating =
                                    getRating(item);

                                return (
                                    <div
                                        key={
                                            item?.id ||
                                            item?.feedbackId ||
                                            `${getCaseNumber(
                                                item
                                            )}-${index}`
                                        }
                                        className="px-6 py-5 transition-colors hover:bg-slate-50/60 sm:px-7"
                                    >

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <span className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                                        Case #
                                                        {getCaseNumber(
                                                            item
                                                        )}
                                                    </span>

                                                    <span className="text-[10px] text-slate-400">
                                                        {getDate(
                                                            item
                                                        )}
                                                    </span>

                                                </div>

                                                <h3 className="mt-2.5 text-sm font-bold text-slate-900">
                                                    {getCustomerName(
                                                        item
                                                    )}
                                                </h3>

                                            </div>

                                            <div className="flex items-center gap-3">

                                                {renderStars(
                                                    rating
                                                )}

                                                <span className="text-sm font-bold text-slate-700">
                                                    {rating >
                                                    0
                                                        ? rating.toFixed(
                                                              1
                                                          )
                                                        : "—"}
                                                </span>

                                            </div>

                                        </div>

                                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">

                                            <p className="text-sm leading-6 text-slate-600">
                                                “
                                                {getComment(
                                                    item
                                                )}
                                                ”
                                            </p>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    Feedback analytics active

                </div>

                <div className="flex items-center gap-2">

                    <Activity className="h-3 w-3" />

                    Data reflects your completed support cases

                </div>

            </div>

        </div>
    );
}

/*
============================================================
FEEDBACK METRIC
============================================================
*/

function FeedbackMetric({
    label,
    value,
    suffix,
    description,
    icon: Icon,
    tone = "blue",
    loading,
}) {
    const tones = {
        blue: {
            icon: "bg-[#edf4fd] text-[#527eb9]",
            line: "bg-[#527eb9]",
        },

        green: {
            icon: "bg-[#edf8f4] text-[#37876c]",
            line: "bg-[#37876c]",
        },

        gold: {
            icon: "bg-[#fff7e8] text-[#c58a27]",
            line: "bg-[#c58a27]",
        },

        slate: {
            icon: "bg-slate-100 text-slate-600",
            line: "bg-slate-500",
        },
    };

    const currentTone =
        tones[tone] || tones.blue;

    return (
        <div
            className="
                group relative overflow-hidden
                rounded-[20px]
                border border-slate-200/80
                bg-white
                p-5
                shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:shadow-[0_16px_38px_rgba(16,32,55,0.075)]
            "
        >

            <div
                className={`
                    absolute left-0 top-0
                    h-[3px] w-0
                    ${currentTone.line}
                    transition-all duration-300
                    group-hover:w-full
                `}
            />

            <div className="flex items-start justify-between">

                <div
                    className={`
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        ${currentTone.icon}
                    `}
                >
                    <Icon className="h-4 w-4" />
                </div>

                <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-300">
                    Live
                </span>

            </div>

            <div className="mt-6">

                <p className="text-[10px] font-medium text-slate-400">
                    {label}
                </p>

                <div className="mt-1.5 flex min-h-[36px] items-end gap-2">

                    {loading ? (

                        <div className="h-7 w-12 animate-pulse rounded-md bg-slate-100" />

                    ) : (

                        <>
                            <p className="font-display text-[29px] font-bold tracking-[-0.045em] text-[#101a28]">
                                {value}
                            </p>

                            {suffix && (
                                <span className="mb-1 text-xs text-slate-400">
                                    {suffix}
                                </span>
                            )}
                        </>

                    )}

                </div>

                <p className="mt-2 text-[10px] text-slate-400">
                    {description}
                </p>

            </div>

        </div>
    );
}

/*
============================================================
SNAPSHOT ROW
============================================================
*/

function SnapshotRow({
    label,
    description,
    value,
    icon: Icon,
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">

            <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">

                    <Icon className="h-4 w-4" />

                </div>

                <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-900">
                        {label}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {description}
                    </p>

                </div>

            </div>

            <span className="shrink-0 text-xl font-bold tracking-tight text-slate-950">
                {value}
            </span>

        </div>
    );
}

/*
============================================================
EMPTY STATE
============================================================
*/

function EmptyState({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">

                <Icon className="h-5 w-5" />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
                {title}
            </h3>

            <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                {description}
            </p>

        </div>
    );
}