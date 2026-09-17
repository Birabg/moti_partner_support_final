import {
    FaStar,
    FaComments,
    FaPercentage,
} from "react-icons/fa";

export default function FeedbackSummary({
    summary = {},
}) {
    const cards = [
        {
            title: "Average Rating",
            value: Number(
                summary.averageSatisfactionScore ?? 0
            ).toFixed(1),
            icon: <FaStar />,
            bg: "bg-amber-50",
            color: "text-amber-500",
        },
        {
            title: "Reviews Received",
            value:
                summary.casesWithFeedbackReceived ?? 0,
            icon: <FaComments />,
            bg: "bg-blue-50",
            color: "text-blue-600",
        },
        {
            title: "Feedback Rate",
            value: `${
                summary.feedbackSubmissionRatePercentage ?? 0
            }%`,
            icon: <FaPercentage />,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-md
                    "
                >
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                {card.title}
                            </p>

                            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                {card.value}
                            </h3>
                        </div>

                        <div
                            className={`
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                text-lg
                                ${card.bg}
                                ${card.color}
                            `}
                        >
                            {card.icon}
                        </div>
                    </div>

                    <div className="mt-5 h-px bg-slate-100" />

                    <p className="mt-4 text-xs text-slate-400">
                        Based on customer feedback
                    </p>
                </div>
            ))}
        </div>
    );
}
