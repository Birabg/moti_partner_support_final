import {
    RefreshCw,
    FileDown,
} from "lucide-react";

import ExportButtons from "./ExportButtons";

export default function CaseToolbar({
    refresh,
    cases,
}) {
    return (
        <div
            className="
                flex
                min-h-[68px]
                flex-col
                gap-4
                px-4
                py-3
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
            "
        >
            {/* =================================================
                LEFT — TOOLBAR INFORMATION
            ================================================= */}

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
                        hidden
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-600
                        sm:flex
                    "
                >
                    <FileDown
                        size={17}
                        strokeWidth={2}
                    />
                </div>

                <div className="min-w-0">
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <p
                            className="
                                truncate
                                text-sm
                                font-bold
                                text-slate-900
                            "
                        >
                            Case Management
                        </p>

                        <span
                            className="
                                hidden
                                h-1
                                w-1
                                rounded-full
                                bg-slate-300
                                sm:block
                            "
                        />

                        <span
                            className="
                                hidden
                                text-[11px]
                                font-medium
                                text-slate-400
                                sm:block
                            "
                        >
                            {cases?.length || 0} cases
                        </span>
                    </div>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-slate-500
                        "
                    >
                        Export, refresh, and manage your case data
                    </p>
                </div>
            </div>

            {/* =================================================
                RIGHT — ACTIONS
            ================================================= */}

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
                    EXPORT BUTTONS
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
                        h-8
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
                        h-10
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-slate-950
                        px-4
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-slate-800
                        hover:shadow-md
                        active:scale-[0.98]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-slate-300
                        focus:ring-offset-2
                    "
                >
                    <RefreshCw
                        size={15}
                        strokeWidth={2.2}
                    />

                    <span>
                        Refresh
                    </span>
                </button>
            </div>
        </div>
    );
}