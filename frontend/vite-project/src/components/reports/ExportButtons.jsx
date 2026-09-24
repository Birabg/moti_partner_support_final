import { useState } from "react";
import {
    FaFilePdf,
    FaFileExcel,
    FaFileCsv,
    FaDownload,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle,
} from "react-icons/fa";

import { ReportsApi } from "../../api/reportsApi";

const FORMATS = [
    {
        id: "pdf",
        title: "PDF",
        filename: "Reports.pdf",
        icon: FaFilePdf,
        buttonClass:
            "border-red-100 bg-red-50/60 text-red-600 hover:border-red-200 hover:bg-red-50",
    },
    {
        id: "excel",
        title: "Excel",
        filename: "Reports.xlsx",
        icon: FaFileExcel,
        buttonClass:
            "border-emerald-100 bg-emerald-50/60 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50",
    },
    {
        id: "csv",
        title: "CSV",
        filename: "Reports.csv",
        icon: FaFileCsv,
        buttonClass:
            "border-blue-100 bg-blue-50/60 text-blue-600 hover:border-blue-200 hover:bg-blue-50",
    },
];

function getFilePromise(formatId) {
    switch (formatId) {
        case "pdf":
            return ReportsApi.exportPdf();

        case "excel":
            return ReportsApi.exportExcel();

        default:
            return ReportsApi.exportCsv();
    }
}

export default function ExportButtons() {
    const [generating, setGenerating] = useState(null);
    const [feedback, setFeedback] = useState(null);

    async function download(format) {
        try {
            setGenerating(format.id);
            setFeedback(null);

            const response = await getFilePromise(format.id);

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.download = format.filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setFeedback({
                type: "success",
                message: `${format.title} report downloaded successfully.`,
            });
        } catch (error) {
            console.log(error);

            setFeedback({
                type: "error",
                message: "Export failed. Please try again.",
            });
        } finally {
            setGenerating(null);
        }
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-16px_rgba(15,23,42,0.14)]">
            {/* HEADER */}
            <div className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <FaDownload className="text-sm" />
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Export Center
                        </p>

                        <h2 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">
                            Download Report
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Export support analytics in the format you need.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {FORMATS.map((format) => {
                        const Icon = format.icon;
                        const isGenerating = generating === format.id;

                        return (
                            <button
                                key={format.id}
                                type="button"
                                onClick={() => download(format)}
                                disabled={generating !== null}
                                className={`
                                    inline-flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    px-4
                                    text-xs
                                    font-semibold
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    ${format.buttonClass}
                                `}
                            >
                                {isGenerating ? (
                                    <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Icon className="h-3.5 w-3.5" />
                                )}

                                {isGenerating
                                    ? "Generating..."
                                    : format.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* FEEDBACK BAR */}
            {feedback && (
                <div
                    className={`
                        flex
                        items-center
                        gap-2
                        border-t
                        px-6
                        py-2.5
                        text-xs
                        font-medium
                        ${
                            feedback.type === "success"
                                ? "border-emerald-100 bg-emerald-50/70 text-emerald-700"
                                : "border-red-100 bg-red-50/70 text-red-600"
                        }
                    `}
                >
                    {feedback.type === "success" ? (
                        <FaCheckCircle className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                        <FaExclamationCircle className="h-3.5 w-3.5 shrink-0" />
                    )}

                    {feedback.message}
                </div>
            )}
        </section>
    );
}