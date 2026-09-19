import { BarChart3, RefreshCw } from "lucide-react";

import AdminPageHero from "../admin/AdminPageHero";

export default function DashboardHeader({ onRefresh, loading = false }) {
    return (
        <AdminPageHero
            eyebrow="Reports & Analytics"
            title="Reports & Analytics"
            description="Executive overview of customer support performance."
            icon={BarChart3}
            right={
                onRefresh ? (
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
                            border-white/10
                            bg-white/[0.08]
                            px-4
                            text-xs
                            font-semibold
                            text-white
                            shadow-sm
                            backdrop-blur-md
                            transition
                            hover:bg-white/[0.14]
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
                ) : null
            }
        />
    );
}