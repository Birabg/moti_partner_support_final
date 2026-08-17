import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { getMyCases, submitFeedback as submitCaseFeedback } from "../../api/customerCaseApi";

export default function CustomerFeedback() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCases();
    }, []);

    async function loadCases() {
        setLoading(true);
        try {
            const response = await getMyCases();
            let casesData =
                response.data?.data?.history ||
                response.data?.data?.cases ||
                response.data?.history ||
                response.data?.cases ||
                [];

            if (!Array.isArray(casesData)) {
                casesData = [];
            }

            const resolved = casesData.filter(
                (c) => (c.status === "RESOLVED" || c.status === "CLOSED") && !c.feedback
            );

            setCases(resolved);
        } catch (error) {
            console.error(error);
            setCases([]);
        } finally {
            setLoading(false);
        }
    }

    async function submitFeedback() {
        if (!selectedCase) return;

        try {
            await submitCaseFeedback(selectedCase.id, rating, comment);
            alert("Feedback submitted successfully.");
            await loadCases();
            setSelectedCase(null);
            setComment("");
            setRating(5);
        } catch (error) {
            // Improved error details for debugging backend 500s
            console.error("Feedback submit error:", {
                message: error?.message,
                status: error?.response?.status,
                responseData: error?.response?.data,
                stack: error?.stack,
            });

            const serverMessage = error?.response?.data?.message || error?.response?.data || null;
            alert(serverMessage || `Unable to submit feedback (status ${error?.response?.status || 'unknown'}).`);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Customer Feedback" subtitle="Submit feedback for your resolved cases." />

            <Card>
                <CardHeader className="items-center gap-4">
                    <div>
                        <CardTitle>Open Feedback Requests</CardTitle>
                        <p className="text-sm text-slate-500">Submit feedback for resolved cases that still need your review.</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Case #</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-slate-500">
                                            Loading cases...
                                        </TableCell>
                                    </TableRow>
                                ) : cases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-slate-500">
                                            No resolved cases awaiting feedback.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cases.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.caseNumber}</TableCell>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell>{item.status}</TableCell>
                                            <TableCell>
                                                <Button variant="accent" size="sm" type="button" onClick={() => setSelectedCase(item)}>
                                                    Leave Feedback
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="items-start gap-4">
                            <div>
                                <CardTitle>Feedback for Case {selectedCase.caseNumber}</CardTitle>
                                <p className="text-sm text-slate-500">Rate your experience and leave optional comments.</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <p className="text-sm text-slate-500 mb-3">Rating</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="rounded-full p-2 transition hover:bg-slate-100"
                                        >
                                            {star <= rating ? (
                                                <FaStar className="text-amber-500" />
                                            ) : (
                                                <FaRegStar className="text-slate-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-slate-500 mb-2">Comment</label>
                                <textarea
                                    rows={5}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
                                    placeholder="Tell us about your experience..."
                                />
                            </div>

                            <div className="flex flex-wrap justify-end gap-3">
                                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedCase(null)}>
                                    Cancel
                                </Button>
                                <Button variant="accent" size="sm" type="button" onClick={submitFeedback}>
                                    Submit Feedback
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
