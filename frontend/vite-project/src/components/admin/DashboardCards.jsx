import { useEffect, useState } from "react";
import {
    Building2,
    Clock3,
    ClipboardList,
    Loader2,
    ArrowUpRight,
} from "lucide-react";

import { OrganizationApi } from "../../api/organizationApi";
import { ApprovalApi } from "../../api/approvalApi";
import { AnalyticsApi } from "../../api/analyticsApi";

const CARD_CONFIG = [
    {
        key: "organizations",
        title: "Organizations",
        description: "Registered partners",
        icon: Building2,
        accent: "blue",
    },
    {
        key: "pending",
        title: "Pending users",
        description: "Awaiting approval",
        icon: Clock3,
        accent: "amber",
    },
    {
        key: "cases",
        title: "Total cases",
        description: "Across the platform",
        icon: ClipboardList,
        accent: "green",
    },
];

const ACCENTS = {
    blue: {
        icon: "bg-[#edf4fd] text-[#527eb9]",
        line: "bg-[#527eb9]",
    },
    amber: {
        icon: "bg-[#fff7e8] text-[#c58a27]",
        line: "bg-[#d59a32]",
    },
    green: {
        icon: "bg-[#edf8f4] text-[#37876c]",
        line: "bg-[#4b9c7e]",
    },
};

export default function DashboardCards() {
    const [organizations, setOrganizations] = useState(0);
    const [pending, setPending] = useState(0);
    const [cases, setCases] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();

        const refresh = () => load();
        const handleCaseUpdated = () => load();

        window.addEventListener("focus", refresh);
        window.addEventListener("cases:updated", handleCaseUpdated);

        const intervalId = window.setInterval(refresh, 10000);

        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("cases:updated", handleCaseUpdated);
            window.clearInterval(intervalId);
        };
    }, []);

    async function load() {
        try {
            const [orgRes, pendingRes, caseRes] = await Promise.all([
                OrganizationApi.getAll(),
                ApprovalApi.getPending(),
                AnalyticsApi.getCaseSummary(),
            ]);

            const orgCount = Array.isArray(orgRes?.data?.data)
                ? orgRes.data.data.length
                : 0;

            const pendingCount =
                (pendingRes?.data?.data?.customers?.length || 0) +
                (pendingRes?.data?.data?.staff?.length || 0);

            const totalCases = caseRes?.data?.data?.total || 0;

            setOrganizations(orgCount);
            setPending(pendingCount);
            setCases(totalCases);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const values = {
        organizations,
        pending,
        cases,
    };

    return (
        <div className="grid gap-4 md:grid-cols-3">

            {CARD_CONFIG.map((card) => {
                const Icon = card.icon;
                const accent = ACCENTS[card.accent];

                return (
                    <div
                        key={card.key}
                        className="
                            group relative overflow-hidden
                            rounded-[20px]
                            border border-slate-200/80
                            bg-white
                            p-5
                            shadow-[0_8px_30px_rgba(16,32,55,0.045)]
                            transition-all duration-300
                            hover:-translate-y-0.5
                            hover:border-slate-300
                            hover:shadow-[0_16px_38px_rgba(16,32,55,0.075)]
                        "
                    >

                        {/* Accent line */}
                        <div
                            className={`absolute left-0 top-0 h-[3px] w-0 ${accent.line} transition-all duration-300 group-hover:w-full`}
                        />

                        <div className="flex items-start justify-between">

                            <div
                                className={`
                                    flex h-11 w-11 items-center justify-center
                                    rounded-xl
                                    ${accent.icon}
                                `}
                            >
                                <Icon size={18} strokeWidth={1.8} />
                            </div>

                            <ArrowUpRight
                                size={15}
                                className="
                                    text-slate-300
                                    transition-all duration-300
                                    group-hover:-translate-y-0.5
                                    group-hover:translate-x-0.5
                                    group-hover:text-slate-500
                                "
                            />
                        </div>

                        <div className="mt-6">

                            <p className="text-[11px] font-medium text-slate-400">
                                {card.title}
                            </p>

                            <div className="mt-1.5 flex min-h-[38px] items-center">

                                {loading ? (
                                    <Loader2
                                        size={22}
                                        className="animate-spin text-[#567fbd]"
                                    />
                                ) : (
                                    <span className="font-display text-[30px] font-bold tracking-[-0.04em] text-[#101a28]">
                                        {values[card.key].toLocaleString()}
                                    </span>
                                )}

                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                    {card.description}
                                </span>

                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                            </div>

                        </div>
                    </div>
                );
            })}

        </div>
    );
}