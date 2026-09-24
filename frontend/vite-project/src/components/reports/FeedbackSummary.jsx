import {
    FaStar,
    FaComments,
    FaPercentage,
    FaThumbsUp,
} from "react-icons/fa";

export default function FeedbackSummary({
    summary = {},
}) {
    const averageRating = Number(
        summary.averageSatisfactionScore ?? 0
    );

    const reviewsCount =
        summary.casesWithFeedbackReceived ?? 0;

    const feedbackRate =
        summary.feedbackSubmissionRatePercentage ?? 0;

    const cards = [
        {
            id: "rating",
            title: "Average Rating",
            value: averageRating.toFixed(1),
            suffix: "/ 5",
            icon: <FaStar />,
            bg: "bg-amber-50",
            color: "text-amber-500",
            accent: "bg-amber-400",
            progress: Math.min(
                100,
                Math.max(0, averageRating * 20)
            ),
        },
        {
            id: "reviews",
            title: "Reviews Received",
            value: reviewsCount,
            suffix: "",
            icon: <FaComments />,
            bg: "bg-blue-50",
            color: "text-blue-600",
            accent: "bg-blue-500",
            progress: Math.min(100, reviewsCount * 10),
        },
        {
            id: "feedback",
            title: "Feedback Rate",
            value: `${feedbackRate}%`,
            suffix: "",
            icon: <FaPercentage />,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            accent: "bg-emerald-500",
            progress: Math.min(100, feedbackRate),
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex items-center justify-between">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-base ${card.bg} ${card.color}`}
                        >
                            {card.icon}
                        </div>

                        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Satisfaction
                        </span>
                    </div>

                    <div className="mt-5 flex items-end gap-2">
                        <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {card.value}
                        </h3>

                        {card.suffix && (
                            <span className="mb-1 text-sm font-medium text-slate-400">
                                {card.suffix}
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {card.title}
                    </p>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full ${card.accent}`}
                            style={{
                                width: `${card.progress}%`,
                            }}
                        />
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <FaThumbsUp className="h-3 w-3 text-emerald-500" />
                        Based on customer feedback
                    </p>

                    <div
                        className={`absolute bottom-0 left-0 right-0 h-1 ${card.accent} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                </div>
            ))}
        </div>
    );
}