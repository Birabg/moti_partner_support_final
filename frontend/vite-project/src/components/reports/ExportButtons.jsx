import {
    FaFilePdf,
    FaFileExcel,
    FaFileCsv,
    FaDownload,
    FaChevronRight,
} from "react-icons/fa";

import Button from "../ui/Button";
import { ReportsApi } from "../../api/reportsApi";

export default function ExportButtons() {
    async function download(filePromise, filename) {
        try {
            const response = await filePromise;

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
            alert("Export failed.");
        }
    }

    const exportOptions = [
        {
            id: "pdf",
            title: "PDF Report",
            description: "Formatted document",
            format: "PDF",
            icon: FaFilePdf,
            iconWrapper:
                "bg-red-50 text-red-600 group-hover:bg-red-100",
            border:
                "hover:border-red-200",
            action: () =>
                download(
                    ReportsApi.exportPdf(),
                    "Reports.pdf"
                ),
        },
        {
            id: "excel",
            title: "Excel Workbook",
            description: "Detailed spreadsheet",
            format: "XLSX",
            icon: FaFileExcel,
            iconWrapper:
                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
            border:
                "hover:border-emerald-200",
            action: () =>
                download(
                    ReportsApi.exportExcel(),
                    "Reports.xlsx"
                ),
        },
        {
            id: "csv",
            title: "CSV Data",
            description: "Raw report data",
            format: "CSV",
            icon: FaFileCsv,
            iconWrapper:
                "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
            border:
                "hover:border-blue-200",
            action: () =>
                download(
                    ReportsApi.exportCsv(),
                    "Reports.csv"
                ),
        },
    ];

    return (
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]">

            {/* HEADER */}
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <FaDownload className="text-sm" />
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Report Center
                            </p>

                            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                                Export Reports
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Download your support analytics in the format you need.
                            </p>
                        </div>

                    </div>

                    <div className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:block">
                        3 Formats Available
                    </div>

                </div>
            </div>

            {/* EXPORT OPTIONS */}
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">

                {exportOptions.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={item.action}
                            className={`
                                group
                                relative
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                text-left
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:bg-slate-50
                                hover:shadow-[0_10px_25px_-15px_rgba(15,23,42,0.25)]
                                ${item.border}
                            `}
                        >

                            {/* ICON */}
                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    transition-colors
                                    ${item.iconWrapper}
                                `}
                            >
                                <Icon className="text-lg" />
                            </div>

                            {/* TEXT */}
                            <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {item.title}
                                    </p>

                                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                                        {item.format}
                                    </span>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    {item.description}
                                </p>

                            </div>

                            {/* ARROW */}
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300 transition-all group-hover:bg-white group-hover:text-slate-600 group-hover:shadow-sm">
                                <FaChevronRight className="text-[9px]" />
                            </div>

                        </button>
                    );
                })}

            </div>

            {/* FOOTER */}
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-[11px] text-slate-400">
                    Reports are generated using the latest available analytics.
                </p>

                <p className="text-[11px] font-medium text-slate-400">
                    Secure export
                </p>

            </div>

        </section>
    );
}