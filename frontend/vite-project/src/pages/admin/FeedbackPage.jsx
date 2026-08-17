import { useEffect, useState } from "react";
import { FaStar, FaRegCommentDots } from "react-icons/fa";

import { FeedbackApi } from "../../api/feedbackApi";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardContent } from "../../components/ui/card";

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
                total: analytics.summary.casesWithFeedbackReceived,
                average: analytics.summary.averageSatisfactionScore || 0,
            });
        } catch (error) {
            console.log(error);

            setFeedbacks([]);

            setStats({
                total: 0,
                average: 0,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customer Feedback"
                subtitle="Review customer satisfaction scores and comments."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100">
                                <FaStar className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Average Rating</p>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {Number(stats.average).toFixed(1)}
                                </h2>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-100">
                                <FaRegCommentDots className="text-navy-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Reviews</p>
                                <h2 className="text-2xl font-bold text-slate-900">{stats.total}</h2>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!loading && feedbacks.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <FaRegCommentDots className="text-3xl text-slate-400" />
                        </div>

                        <h2 className="mt-6 text-lg font-semibold text-slate-900">No Feedback Yet</h2>

                        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                            Customer feedback will appear here once cases are resolved and customers submit ratings.
                        </p>

                        <div className="mt-8 flex justify-center gap-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900">0</h3>
                                <p className="text-xs text-slate-500">Five Star Reviews</p>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900">0</h3>
                                <p className="text-xs text-slate-500">Positive Comments</p>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900">0</h3>
                                <p className="text-xs text-slate-500">Satisfaction Score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">Loading Feedback...</h2>
                    </CardContent>
                </Card>
            )}

            {!loading &&
                feedbacks.length > 0 &&
                feedbacks.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="text-md font-semibold text-slate-900">{item.assignedAgent}</h2>
                                    <p className="text-sm text-slate-500">Case #{item.caseNumber}</p>
                                </div>

                                <div className="flex gap-1">
                                    {Array.from({ length: item.rating }).map((_, index) => (
                                        <FaStar key={index} className="text-amber-500" />
                                    ))}
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-slate-700">
                                {item.comment || "No additional comments provided."}
                            </p>

                            <p className="mt-3 text-xs text-slate-400">
                                {new Date(item.closedAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
        </div>
    );
}
