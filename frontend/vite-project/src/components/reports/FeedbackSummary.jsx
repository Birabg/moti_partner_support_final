import {
    FaStar,
    FaComments,
    FaPercentage,
} from "react-icons/fa";

export default function FeedbackSummary({
    summary,
}) {
    const cards = [
        {
            title: "Average Rating",
            value:
                summary.averageSatisfactionScore ??
                0,
            icon: <FaStar />,
            bg: "bg-yellow-100",
            color: "text-yellow-600",
        },

        {
            title: "Reviews",
            value:
                summary.casesWithFeedbackReceived ??
                0,
            icon: <FaComments />,
            bg: "bg-navy-100",
            color: "text-navy-600",
        },

        {
            title: "Feedback Rate",
            value: `${
                summary.feedbackSubmissionRatePercentage ??
                0
            }%`,
            icon: <FaPercentage />,
            bg: "bg-green-100",
            color: "text-green-700",
        },
    ];

    return (

        <div>

            <h2 className="text-lg font-semibold text-slate-900 mb-4">

                Customer Satisfaction

            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {cards.map((card) => (

                    <div
                        key={card.title}
                        className="bg-white rounded-lg border shadow-sm p-6"
                    >

                        <div className="flex justify-between items-center">

                            <div>

                                <p className="text-slate-500">
                                    {card.title}
                                </p>

                                <h1 className="text-4xl font-bold mt-3">
                                    {card.value}
                                </h1>

                            </div>

                            <div
                                className={`
                                    w-14
                                    h-14
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    text-2xl
                                    ${card.bg}
                                    ${card.color}
                                `}
                            >
                                {card.icon}
                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );
}