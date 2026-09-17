import { useEffect, useState } from "react";
import {
    FaStar,
    FaRegStar,
    FaTimes,
    FaCommentDots,
    FaTicketAlt,
    FaCheckCircle,
    FaArrowRight,
    FaRegClock,
} from "react-icons/fa";

import { PageHeader } from "../../components/ui/page-header";
import {
    Card,
    CardContent,
} from "../../components/ui/card";
import Button from "../../components/ui/button";

import {
    getMyCases,
    submitFeedback as submitCaseFeedback,
} from "../../api/customerCaseApi";


export default function CustomerFeedback() {

    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Load cases
    |--------------------------------------------------------------------------
    */

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


            const resolvedCases = casesData.filter(
                (item) =>
                    (
                        item.status === "RESOLVED" ||
                        item.status === "CLOSED"
                    ) &&
                    !item.feedback
            );


            setCases(resolvedCases);

        } catch (error) {

            console.error(
                "Failed to load feedback cases:",
                error
            );

            setCases([]);

        } finally {

            setLoading(false);

        }
    }


    /*
    |--------------------------------------------------------------------------
    | Open feedback modal
    |--------------------------------------------------------------------------
    */

    function openFeedback(caseItem) {

        setSelectedCase(caseItem);
        setRating(5);
        setComment("");

    }


    /*
    |--------------------------------------------------------------------------
    | Close feedback modal
    |--------------------------------------------------------------------------
    */

    function closeFeedback() {

        if (submitting) return;

        setSelectedCase(null);
        setRating(5);
        setComment("");

    }


    /*
    |--------------------------------------------------------------------------
    | Submit feedback
    |--------------------------------------------------------------------------
    */

    async function submitFeedback() {

        if (!selectedCase) {
            return;
        }


        if (!rating) {
            alert("Please select a rating.");
            return;
        }


        setSubmitting(true);


        try {

            await submitCaseFeedback(
                selectedCase.id,
                rating,
                comment
            );


            alert(
                "Feedback submitted successfully."
            );


            setSelectedCase(null);
            setComment("");
            setRating(5);


            await loadCases();

        } catch (error) {

            console.error(
                "Feedback submit error:",
                {
                    message: error?.message,
                    status: error?.response?.status,
                    responseData:
                        error?.response?.data,
                    stack: error?.stack,
                }
            );


            const serverMessage =
                error?.response?.data?.message ||
                (
                    typeof error?.response?.data ===
                    "string"
                        ? error.response.data
                        : null
                );


            alert(
                serverMessage ||
                `Unable to submit feedback (status ${
                    error?.response?.status ||
                    "unknown"
                }).`
            );

        } finally {

            setSubmitting(false);

        }
    }


    /*
    |--------------------------------------------------------------------------
    | Rating labels
    |--------------------------------------------------------------------------
    */

    const ratingLabels = {
        1: "Very poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent",
    };


    return (

        <div className="min-h-full space-y-6 pb-8">


            {/* =========================================================
                PAGE HEADER
            ========================================================== */}

            <PageHeader
                title="Customer Feedback"
                subtitle="Tell us about your experience with our support team."
            />


            {/* =========================================================
                SUMMARY
            ========================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* Pending */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Pending feedback
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {loading ? "—" : cases.length}
                            </p>

                        </div>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">

                            <FaRegClock className="text-base" />

                        </div>

                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        Resolved cases awaiting your review
                    </p>

                </div>


                {/* Rating */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Your rating
                            </p>

                            <div className="mt-2 flex items-center gap-1">

                                {[1, 2, 3, 4, 5].map(
                                    (star) => (
                                        <FaStar
                                            key={star}
                                            className="text-sm text-amber-400"
                                        />
                                    )
                                )}

                            </div>

                        </div>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500">

                            <FaCommentDots className="text-base" />

                        </div>

                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        Every response helps us improve
                    </p>

                </div>


                {/* Experience */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Quick & easy
                            </p>

                            <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                                Takes less than a minute
                            </p>

                        </div>


                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">

                            <FaCheckCircle className="text-base" />

                        </div>

                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        Rate your support experience
                    </p>

                </div>

            </div>


            {/* =========================================================
                FEEDBACK REQUESTS
            ========================================================== */}

            <Card className="overflow-hidden border border-slate-200 shadow-sm">

                {/* Header */}

                <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">

                                    <FaCommentDots className="text-sm" />

                                </div>

                                <h2 className="text-base font-bold text-slate-900">
                                    Feedback Requests
                                </h2>

                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                                Share your experience on recently resolved cases.
                            </p>

                        </div>


                        {!loading && cases.length > 0 && (

                            <div className="inline-flex w-fit items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">

                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-500" />

                                {cases.length} pending

                            </div>

                        )}

                    </div>

                </div>


                <CardContent className="p-0">


                    {/* =================================================
                        LOADING
                    ================================================== */}

                    {loading && (

                        <div className="px-6 py-16">

                            <div className="flex flex-col items-center justify-center">

                                <div className="relative h-10 w-10">

                                    <div className="absolute inset-0 rounded-full border-2 border-slate-100" />

                                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-slate-800" />

                                </div>


                                <p className="mt-4 text-sm font-medium text-slate-600">
                                    Loading feedback requests...
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Please wait a moment
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}

                    {!loading && cases.length === 0 && (

                        <div className="px-6 py-16 sm:py-20">

                            <div className="mx-auto flex max-w-md flex-col items-center text-center">

                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">

                                    <FaCheckCircle className="text-2xl" />

                                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />

                                </div>


                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    You're all caught up
                                </h3>


                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    There are no resolved cases waiting
                                    for your feedback right now.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        DESKTOP TABLE
                    ================================================== */}

                    {!loading && cases.length > 0 && (

                        <>

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50/60">

                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                Case
                                            </th>

                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                Subject
                                            </th>

                                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                Status
                                            </th>

                                            <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {cases.map((item) => (

                                            <tr
                                                key={item.id}
                                                className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                                            >

                                                {/* Case */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white">

                                                            <FaTicketAlt className="text-xs" />

                                                        </div>


                                                        <div>

                                                            <p className="text-sm font-bold text-slate-800">
                                                                #{item.caseNumber || "N/A"}
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                Support case
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Subject */}

                                                <td className="max-w-[360px] px-6 py-4">

                                                    <p
                                                        className="truncate text-sm font-semibold text-slate-800"
                                                        title={
                                                            item.subject ||
                                                            "Untitled Case"
                                                        }
                                                    >
                                                        {item.subject ||
                                                            "Untitled Case"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Your feedback helps us improve
                                                    </p>

                                                </td>


                                                {/* Status */}

                                                <td className="px-6 py-4">

                                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">

                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                        {item.status}

                                                    </span>

                                                </td>


                                                {/* Action */}

                                                <td className="px-6 py-4 text-right">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openFeedback(item)
                                                        }
                                                        className="group/button inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
                                                    >

                                                        Leave Feedback

                                                        <FaArrowRight className="text-[9px] transition-transform group-hover/button:translate-x-0.5" />

                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>


                            {/* =================================================
                                MOBILE CARDS
                            ================================================== */}

                            <div className="divide-y divide-slate-100 md:hidden">

                                {cases.map((item) => (

                                    <div
                                        key={item.id}
                                        className="p-5"
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">

                                                    <FaTicketAlt className="text-xs" />

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="text-sm font-bold text-slate-800">
                                                        #{item.caseNumber || "N/A"}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                                        Support case
                                                    </p>

                                                </div>

                                            </div>


                                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">

                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                {item.status}

                                            </span>

                                        </div>


                                        <div className="mt-4">

                                            <p className="text-sm font-semibold leading-5 text-slate-800">
                                                {item.subject ||
                                                    "Untitled Case"}
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                openFeedback(item)
                                            }
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-[0.99]"
                                        >

                                            Leave Feedback

                                            <FaArrowRight className="text-[9px]" />

                                        </button>

                                    </div>

                                ))}

                            </div>

                        </>

                    )}

                </CardContent>

            </Card>


            {/* =========================================================
                FEEDBACK MODAL
            ========================================================== */}

            {selectedCase && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeFeedback();
                        }

                    }}
                >

                    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">


                        {/* =================================================
                            MODAL HEADER
                        ================================================== */}

                        <div className="relative border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">

                                        <FaCommentDots className="text-sm" />

                                    </div>


                                    <div className="min-w-0">

                                        <h2 className="text-base font-bold text-slate-900">
                                            Share your feedback
                                        </h2>

                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                            Case #{selectedCase.caseNumber}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeFeedback}
                                    disabled={submitting}
                                    aria-label="Close feedback dialog"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <FaTimes className="text-sm" />

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            MODAL CONTENT
                        ================================================== */}

                        <div className="px-5 py-6 sm:px-6">


                            {/* Case preview */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">

                                        <FaTicketAlt className="text-xs" />

                                    </div>


                                    <div className="min-w-0">

                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Resolved case
                                        </p>

                                        <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
                                            {selectedCase.subject ||
                                                "Untitled Case"}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Rating */}

                            <div className="mt-7">

                                <div className="text-center">

                                    <p className="text-sm font-bold text-slate-800">
                                        How was your support experience?
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Your feedback helps us improve our service.
                                    </p>

                                </div>


                                <div className="mt-5 flex justify-center">

                                    <div className="flex items-center rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2">

                                        {[1, 2, 3, 4, 5].map(
                                            (star) => (

                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={submitting}
                                                    onClick={() =>
                                                        setRating(star)
                                                    }
                                                    aria-label={`Rate ${star} out of 5`}
                                                    className="group flex h-12 w-12 items-center justify-center rounded-xl transition hover:bg-white disabled:cursor-not-allowed"
                                                >

                                                    {star <= rating ? (

                                                        <FaStar className="text-2xl text-amber-400 transition-transform group-hover:scale-110" />

                                                    ) : (

                                                        <FaRegStar className="text-2xl text-slate-300 transition-transform group-hover:scale-110 group-hover:text-amber-300" />

                                                    )}

                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>


                                <div className="mt-3 text-center">

                                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">

                                        {ratingLabels[rating]}

                                    </span>

                                </div>

                            </div>


                            {/* Comment */}

                            <div className="mt-7">

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="feedback-comment"
                                        className="text-sm font-bold text-slate-800"
                                    >
                                        Tell us more
                                    </label>

                                    <span className="text-[11px] text-slate-400">
                                        Optional
                                    </span>

                                </div>


                                <textarea
                                    id="feedback-comment"
                                    rows={4}
                                    value={comment}
                                    disabled={submitting}
                                    onChange={(event) =>
                                        setComment(
                                            event.target.value
                                        )
                                    }
                                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    placeholder="What went well? Is there anything we could improve?"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            MODAL FOOTER
                        ================================================== */}

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">

                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={closeFeedback}
                                disabled={submitting}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>


                            <Button
                                variant="accent"
                                size="sm"
                                type="button"
                                onClick={submitFeedback}
                                disabled={submitting}
                                className="w-full sm:w-auto"
                            >

                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">

                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />

                                        Submitting...

                                    </span>
                                ) : (
                                    "Submit Feedback"
                                )}

                            </Button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}
