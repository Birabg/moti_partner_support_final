import {
    RefreshCw,
    Download,
} from "lucide-react";

import ExportButtons from "./ExportButtons";

export default function CaseToolbar({
    refresh,
    cases = [],
}) {
    return (
        <div
            className="
                flex
                w-full
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
            "
        >

            {/* =====================================================
                LEFT — CASE INFORMATION
            ===================================================== */}

            <div
                className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                "
            >

                {/* Icon */}

                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        text-blue-600
                    "
                >
                    <Download
                        size={16}
                        strokeWidth={1.8}
                    />
                </div>


                {/* Text */}

                <div className="min-w-0">

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.14em]
                                text-blue-600
                            "
                        >
                            Case Management
                        </span>


                        <span
                            className="
                                h-1
                                w-1
                                rounded-full
                                bg-slate-300
                            "
                        />


                        <span
                            className="
                                text-[11px]
                                font-medium
                                text-slate-400
                            "
                        >
                            {cases.length}{" "}
                            {cases.length === 1
                                ? "case"
                                : "cases"}
                        </span>

                    </div>


                    <p
                        className="
                            mt-1
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                        "
                    >
                        Your case history
                    </p>

                </div>

            </div>



            {/* =====================================================
                RIGHT — ACTIONS
            ===================================================== */}

            <div
                className="
                    flex
                    w-full
                    items-center
                    gap-2
                    sm:w-auto
                "
            >

                {/* =================================================
                    EXPORT
                ================================================= */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        sm:flex-none
                    "
                >

                    <ExportButtons
                        cases={cases}
                    />

                </div>


                {/* =================================================
                    DIVIDER
                ================================================= */}

                <div
                    className="
                        hidden
                        h-7
                        w-px
                        bg-slate-200
                        sm:block
                    "
                />


                {/* =================================================
                    REFRESH
                ================================================= */}

                <button
                    type="button"
                    onClick={refresh}
                    className="
                        inline-flex
                        h-9
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-[#17345c]
                        bg-[#17345c]
                        px-3.5
                        text-xs
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-[#102949]
                        hover:shadow-md
                        active:scale-[0.98]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-100
                        focus:ring-offset-1
                    "
                >

                    <RefreshCw
                        size={14}
                        strokeWidth={2}
                    />

                    <span>
                        Refresh
                    </span>

                </button>

            </div>

        </div>
    );
}
