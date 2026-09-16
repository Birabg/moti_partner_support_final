import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    Building2,
    ClipboardList,
    Clock3,
    Loader2,
} from "lucide-react";

import { OrganizationApi } from "../../api/organizationApi";
import { ApprovalApi } from "../../api/approvalApi";
import { AnalyticsApi } from "../../api/analyticsApi";

export default function DashboardCards() {
    const [organizations, setOrganizations] = useState(0);
    const [pending, setPending] = useState(0);
    const [cases, setCases] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
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
    };

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

    const cards = [
        {
            title: "Organizations",
            description: "Registered organizations",
            value: organizations,
            icon: Building2,
            to: "/organizations",
            iconWrapper:
                "bg-blue-50 text-blue-600 border-blue-100/80",
            glow: "bg-blue-100/40",
        },
        {
            title: "Pending Users",
            description: "Awaiting approval",
            value: pending,
            icon: Clock3,
            to: "/admin/approval",
            iconWrapper:
                "bg-amber-50 text-amber-600 border-amber-100/80",
            glow: "bg-amber-100/40",
        },
        {
            title: "Total Cases",
            description: "Cases recorded in portal",
            value: cases,
            icon: ClipboardList,
            to: "/admin/cases",
            iconWrapper:
                "bg-emerald-50 text-emerald-600 border-emerald-100/80",
            glow: "bg-emerald-100/40",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <Link
                        key={card.title}
                        to={card.to}
                        aria-label={"Open " + card.title}
                        className="group block h-full rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4"
                    >
                        <article className="relative h-full min-h-[300px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.025)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]">

                            {/* Soft decorative corner */}
                            <div
                                aria-hidden="true"
                                className={
                                    "pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-110 " +
                                    card.glow
                                }
                            />

                            {/* Very subtle top-right surface */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[50px] bg-slate-50/60"
                            />

                            <div className="relative flex h-full flex-col p-6 sm:p-7">

                                {/* Top row */}
                                <div className="flex items-start justify-between">
                                    {/* Icon */}
                                    <div
                                        className={
                                            "flex h-12 w-12 items-center justify-center rounded-[13px] border shadow-[0_2px_5px_rgba(15,23,42,0.025)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-sm " +
                                            card.iconWrapper
                                        }
                                    >
                                        <Icon
                                            className="h-[21px] w-[21px]"
                                            strokeWidth={2}
                                        />
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-all duration-300 group-hover:bg-slate-50 group-hover:text-slate-500">
                                        <ArrowUpRight
                                            className="h-[17px] w-[17px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                </div>

                                {/* Main content */}
                                <div className="mt-7">
                                    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        {card.title}
                                    </p>

                                    <div className="mt-3 min-h-[48px] flex items-center">
                                        {loading ? (
                                            <Loader2
                                                className="h-8 w-8 animate-spin text-slate-300"
                                                strokeWidth={2}
                                            />
                                        ) : (
                                            <span className="text-[40px] font-semibold leading-none tracking-[-0.055em] text-slate-950">
                                                {Number(
                                                    card.value
                                                ).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-4 text-[13px] font-medium text-slate-400">
                                        {card.description}
                                    </p>
                                </div>

                                {/* Bottom */}
                                <div className="mt-auto pt-7">
                                    <div className="h-px w-full bg-slate-100" />

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>

                                            <span className="text-[11px] font-medium text-slate-400">
                                                Updated automatically
                                            </span>
                                        </div>

                                        <span className="text-[10px] font-medium text-slate-300 opacity-0 transition-all duration-300 group-hover:text-slate-400 group-hover:opacity-100">
                                            Open
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                );
            })}
        </div>
    );
}