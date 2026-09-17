import { BarChart3, RefreshCw } from "lucide-react";

export default function DashboardHeader({ onRefresh, loading = false }) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            {/* LEFT */}
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <BarChart3 className="h-4 w-4" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Reports & Analytics
                    </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Reports & Analytics
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                    Executive overview of customer support performance.
                </p>
            </div>

            {/* RIGHT */}
            {onRefresh && (
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="
                        inline-flex
                        h-10
                        w-fit
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-xs
                        font-semibold
                        text-slate-600
                        shadow-sm
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                        hover:text-slate-900
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />

                    Refresh Reports
                </button>
            )}
        </div>
    );
}
