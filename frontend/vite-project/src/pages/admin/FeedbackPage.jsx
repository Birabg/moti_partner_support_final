import { useEffect, useMemo, useState } from "react";
import {
    Star,
    MessageSquareText,
    TrendingUp,
    Users,
    ChevronRight,
} from "lucide-react";

import { FeedbackApi } from "../../api/feedbackApi";

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        average: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedback();
    }, []);

    async function loadFeedback() {
        try {
            setLoading(true);

            const response = await FeedbackApi.getAnalytics();
            const analytics = response.data.data;

            setFeedbacks(analytics.reviews || []);

            setStats({
                total:
                    analytics.summary
                        ?.casesWithFeedbackReceived || 0,

                average:
                    analytics.summary
                        ?.averageSatisfactionScore || 0,
            });
        } catch (error) {
            console.log("Load feedback error", error);

            setFeedbacks([]);

            setStats({
                total: 0,
                average: 0,
            });
        } finally {
            setLoading(false);
        }
    }

    const fiveStarReviews = useMemo(
        () =>
            feedbacks.filter(
                (item) => Number(item.rating) === 5
            ).length,
        [feedbacks]
    );

    const positiveComments = useMemo(
        () =>
            feedbacks.filter(
                (item) =>
                    item.comment &&
                    item.comment.trim().length > 0
            ).length,
        [feedbacks]
    );

    return (
        <div className="space-y-7">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Customer Experience
                    </p>

                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Customer Feedback
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Review customer satisfaction scores,
                        ratings and comments.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadFeedback}
                    disabled={loading}
                    className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                    <TrendingUp
                        className={`h-3.5 w-3.5 ${
                            loading
                                ? "animate-pulse"
                                : ""
                        }`}
                    />

                    Refresh Feedback
                </button>
            </div>

            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <FeedbackStat
                    label="Average Rating"
                    value={Number(stats.average).toFixed(1)}
                    description="Overall customer satisfaction"
                    icon={Star}
                    iconClass="bg-amber-50 text-amber-500"
                    valueClass="text-amber-600"
                />

                <FeedbackStat
                    label="Total Reviews"
                    value={stats.total}
                    description="Cases with feedback received"
                    icon={MessageSquareText}
                    iconClass="bg-blue-50 text-blue-600"
                    valueClass="text-blue-600"
                />

                <FeedbackStat
                    label="Five Star Reviews"
                    value={fiveStarReviews}
                    description="Highest satisfaction ratings"
                    icon={Star}
                    iconClass="bg-emerald-50 text-emerald-600"
                    valueClass="text-emerald-600"
                />

                <FeedbackStat
                    label="Comments"
                    value={positiveComments}
                    description="Reviews containing comments"
                    icon={MessageSquareText}
                    iconClass="bg-violet-50 text-violet-600"
                    valueClass="text-violet-600"
                />
            </div>

            {/* =====================================================
                CONTENT HEADER
            ===================================================== */}

            <div className="flex items-center justify-between">

                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Recent Feedback
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Customer responses from resolved support cases.
                    </p>
                </div>

                {!loading && feedbacks.length > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {feedbacks.length}{" "}
                        {feedbacks.length === 1
                            ? "Review"
                            : "Reviews"}
                    </span>
                )}
            </div>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading && (
                <div className="space-y-4">

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>
            )}

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {!loading && feedbacks.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <MessageSquareText className="h-7 w-7" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        No Feedback Yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                        Customer feedback will appear here once
                        support cases are resolved and customers
                        submit their satisfaction ratings.
                    </p>

                    <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-5">

                        <EmptyMetric
                            value="0"
                            label="Five Star Reviews"
                        />

                        <EmptyMetric
                            value="0"
                            label="Comments"
                        />

                        <EmptyMetric
                            value="0.0"
                            label="Average Score"
                        />
                    </div>
                </div>
            )}

            {/* =====================================================
                FEEDBACK LIST
            ===================================================== */}

            {!loading && feedbacks.length > 0 && (
                <div className="space-y-4">

                    {feedbacks.map((item) => (
                        <FeedbackCard
                            key={item.id}
                            item={item}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function FeedbackStat({
    label,
    value,
    description,
    icon: Icon,
    iconClass,
    valueClass,
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-15px_rgba(15,23,42,0.22)]">

            <div className="p-5">

                <div className="flex items-start justify-between">

                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        Overview
                    </span>
                </div>

                <div className="mt-5">

                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-2 text-3xl font-semibold tracking-tight ${valueClass}`}
                    >
                        {value}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400">
                        {description}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 transition-colors group-hover:bg-slate-200" />
        </div>
    );
}

/* =========================================================
   FEEDBACK CARD
========================================================= */

function FeedbackCard({ item }) {
    const rating = Number(item.rating) || 0;

    const date = item.closedAt
        ? new Date(
              item.closedAt
          ).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "—";

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)] transition-shadow hover:shadow-[0_12px_30px_-15px_rgba(15,23,42,0.22)]">

            <div className="p-5 lg:p-6">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* Customer / case information */}

                    <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Users className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                            <h3 className="truncate text-sm font-semibold text-slate-900">
                                {item.assignedAgent ||
                                    "Assigned Agent"}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                                <span>
                                    Case #{item.caseNumber}
                                </span>

                                <span className="text-slate-200">
                                    •
                                </span>

                                <span>
                                    {date}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}

                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-1">
                            {Array.from({
                                length: 5,
                            }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`h-4 w-4 ${
                                        index < rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-200"
                                    }`}
                                />
                            ))}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Comment */}

                <div className="mt-6 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-start gap-3">

                        <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <p className="text-sm leading-6 text-slate-600">
                            {item.comment ||
                                "No additional comments were provided by the customer."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 lg:px-6">

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                    Customer Satisfaction
                </span>

                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    View Case
                    <ChevronRight className="h-3 w-3" />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY METRIC
========================================================= */

function EmptyMetric({ value, label }) {
    return (
        <div className="px-4">

            <p className="text-xl font-semibold text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </p>
        </div>
    );
}