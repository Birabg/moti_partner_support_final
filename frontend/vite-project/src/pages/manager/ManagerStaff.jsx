import { useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    ArrowUpRight,
    Building2,
    Mail,
    Phone,
    RefreshCw,
    Search,
    ShieldCheck,
    UserCheck,
    UserCircle2,
    Users,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

export default function ManagerStaff() {
    const { user } = useAuth();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    async function loadStaff(showRefresh = false) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await managerApi.getScopeOverview();

            setSnapshot(
                response?.data?.data || null
            );
        } catch (caughtError) {
            console.error(
                "Manager staff load error:",
                caughtError
            );

            setError(
                caughtError?.response?.data?.message ||
                "Could not load staff information."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadStaff();
    }, []);

    const staff =
        snapshot?.hierarchyMetrics?.staffMembers || [];

    const scopeName =
        snapshot?.department?.name ||
        snapshot?.division?.name ||
        snapshot?.section?.name ||
        "Staff Directory";

    const managerRole =
        user?.managerType ||
        user?.role ||
        "Manager";

    const filteredStaff = useMemo(() => {
        const searchText =
            search.trim().toLowerCase();

        if (!searchText) {
            return staff;
        }

        return staff.filter((member) => {
            const fullText = `
                ${member?.firstName || ""}
                ${member?.lastName || ""}
                ${member?.name || ""}
                ${member?.email || ""}
                ${member?.phoneNumber || ""}
                ${member?.phone || ""}
                ${member?.role || ""}
                ${member?.staffRole || ""}
            `.toLowerCase();

            return fullText.includes(searchText);
        });
    }, [staff, search]);

    return (
        <div className="min-h-full bg-slate-50/70">

            <main className="ps-container space-y-7 pb-12">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[26px]
                        bg-[#0b1d38]
                        shadow-[0_16px_40px_rgba(15,35,65,0.10)]
                    "
                >

                    <div
                        className="
                            absolute
                            inset-0
                            opacity-[0.07]
                        "
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                            backgroundSize:
                                "32px 32px",
                        }}
                    />

                    <div
                        className="
                            absolute
                            -right-24
                            -top-24
                            h-72
                            w-72
                            rounded-full
                            bg-blue-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            absolute
                            -bottom-32
                            left-1/3
                            h-64
                            w-64
                            rounded-full
                            bg-indigo-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-7
                            px-6
                            py-7
                            sm:px-8
                            sm:py-8
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div>

                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                <span
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.2em]
                                        text-slate-400
                                    "
                                >
                                    Team Workspace
                                </span>

                            </div>

                            <h1
                                className="
                                    text-2xl
                                    font-semibold
                                    tracking-[-0.035em]
                                    text-white
                                    sm:text-3xl
                                "
                            >
                                Staff Directory
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-slate-400
                                "
                            >
                                View staff members and their
                                contact information within your
                                management scope.
                            </p>

                            <div
                                className="
                                    mt-4
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <Building2 className="h-3 w-3" />

                                    {scopeName}

                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <Users className="h-3 w-3" />

                                    {staff.length} staff members

                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/[0.07]
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >

                                    <ShieldCheck className="h-3 w-3" />

                                    {managerRole}

                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadStaff(true)
                            }
                            disabled={
                                loading ||
                                refreshing
                            }
                            className="
                                inline-flex
                                h-10
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-white
                                px-4
                                text-xs
                                font-semibold
                                text-[#0b1d38]
                                transition
                                hover:bg-slate-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <RefreshCw
                                className={
                                    refreshing
                                        ? "h-3.5 w-3.5 animate-spin"
                                        : "h-3.5 w-3.5"
                                }
                            />

                            Refresh

                        </button>

                    </div>

                </section>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                        "
                    >

                        <div
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-100
                                text-red-600
                            "
                        >
                            <AlertTriangle className="h-4 w-4" />
                        </div>

                        <div>

                            <p className="text-xs font-semibold text-red-800">
                                Staff directory unavailable
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>

                        </div>

                    </div>
                )}

                {/* PAGE INTRO folded into hero above */}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section>

                    <div className="mb-4">

                        <p
                            className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-blue-600
                            "
                        >
                            Team Overview
                        </p>

                        <h2
                            className="
                                mt-1
                                text-xl
                                font-semibold
                                tracking-[-0.025em]
                                text-slate-950
                            "
                        >
                            Staff information
                        </h2>

                    </div>

                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-3
                        "
                    >

                        <SummaryCard
                            icon={Users}
                            label="Staff Members"
                            value={staff.length}
                            description="Visible staff in your scope"
                            iconClass="bg-[#edf4fd] text-[#527eb9]"
                        />

                        <SummaryCard
                            icon={ShieldCheck}
                            label="Management Scope"
                            value={scopeName}
                            description="Current organizational unit"
                            iconClass="bg-[#edf7f3] text-[#3b8d73]"
                        />

                        <SummaryCard
                            icon={UserCheck}
                            label="Manager Role"
                            value={managerRole}
                            description="Current access level"
                            iconClass="bg-[#fff7e8] text-[#c58a27]"
                        />

                    </div>

                </section>

                {/* =================================================
                    STAFF REGISTRY
                ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(15,35,65,0.045)]
                    "
                >

                    {/* Registry Header */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            border-b
                            border-slate-100
                            px-6
                            py-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:px-7
                        "
                    >

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                "
                            >
                                <Users className="h-4 w-4" />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.18em]
                                        text-blue-600
                                    "
                                >
                                    Staff Registry
                                </p>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        tracking-[-0.02em]
                                        text-slate-950
                                    "
                                >
                                    Team Members
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    {filteredStaff.length}{" "}
                                    {filteredStaff.length === 1
                                        ? "staff member"
                                        : "staff members"}{" "}
                                    displayed
                                </p>

                            </div>

                        </div>

                        <div
                            className="
                                relative
                                w-full
                                sm:w-72
                            "
                        >

                            <Search
                                size={15}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search staff..."
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    pl-9
                                    pr-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-blue-300
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-blue-50
                                "
                            />

                        </div>

                    </div>

                    {/* Table */}

                    {loading ? (

                        <StaffSkeleton />

                    ) : filteredStaff.length === 0 ? (

                        <EmptyStaffState
                            hasSearch={Boolean(search)}
                        />

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead>

                                    <tr
                                        className="
                                            border-b
                                            border-slate-100
                                            bg-slate-50/70
                                        "
                                    >

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Staff Member
                                        </th>

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Email
                                        </th>

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Phone
                                        </th>

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Role
                                        </th>

                                        <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredStaff.map(
                                        (member, index) => {

                                            const name =
                                                `${member?.firstName || ""} ${
                                                    member?.lastName || ""
                                                }`.trim() ||
                                                member?.name ||
                                                "Staff Member";

                                            const email =
                                                member?.email ||
                                                "—";

                                            const phone =
                                                member?.phoneNumber ||
                                                member?.phone ||
                                                "—";

                                            const role =
                                                member?.role ||
                                                member?.staffRole ||
                                                "Staff";

                                            const initials =
                                                name
                                                    .split(" ")
                                                    .filter(Boolean)
                                                    .slice(0, 2)
                                                    .map(
                                                        (part) =>
                                                            part[0]
                                                    )
                                                    .join("")
                                                    .toUpperCase();

                                            return (
                                                <tr
                                                    key={
                                                        member?.id ||
                                                        index
                                                    }
                                                    className="
                                                        group
                                                        border-b
                                                        border-slate-100
                                                        transition
                                                        last:border-b-0
                                                        hover:bg-slate-50/60
                                                    "
                                                >

                                                    {/* Staff */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-10
                                                                    w-10
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    bg-slate-100
                                                                    text-[11px]
                                                                    font-bold
                                                                    text-slate-600
                                                                    transition
                                                                    group-hover:bg-blue-50
                                                                    group-hover:text-blue-600
                                                                "
                                                            >
                                                                {initials ||
                                                                    <UserCircle2
                                                                        size={18}
                                                                    />
                                                                }
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p
                                                                    className="
                                                                        truncate
                                                                        text-sm
                                                                        font-semibold
                                                                        text-slate-800
                                                                    "
                                                                >
                                                                    {name}
                                                                </p>

                                                                <p
                                                                    className="
                                                                        mt-0.5
                                                                        text-[10px]
                                                                        text-slate-400
                                                                    "
                                                                >
                                                                    Staff member
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Email */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2">

                                                            <Mail
                                                                size={13}
                                                                className="shrink-0 text-slate-400"
                                                            />

                                                            <span
                                                                className="
                                                                    max-w-[240px]
                                                                    truncate
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-600
                                                                "
                                                            >
                                                                {email}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* Phone */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2">

                                                            <Phone
                                                                size={13}
                                                                className="shrink-0 text-slate-400"
                                                            />

                                                            <span
                                                                className="
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-600
                                                                "
                                                            >
                                                                {phone}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* Role */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                rounded-full
                                                                border
                                                                border-slate-200
                                                                bg-slate-50
                                                                px-2.5
                                                                py-1
                                                                text-[10px]
                                                                font-bold
                                                                text-slate-600
                                                            "
                                                        >
                                                            {role}
                                                        </span>

                                                    </td>

                                                    {/* Status */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center justify-end gap-2">

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    border-emerald-100
                                                                    bg-emerald-50
                                                                    px-2.5
                                                                    py-1
                                                                    text-[9px]
                                                                    font-bold
                                                                    uppercase
                                                                    tracking-[0.08em]
                                                                    text-emerald-700
                                                                "
                                                            >
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                Active
                                                            </span>

                                                            <ArrowUpRight
                                                                size={13}
                                                                className="
                                                                    text-slate-300
                                                                    transition
                                                                    group-hover:text-blue-500
                                                                "
                                                            />

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
}) {
    return (
        <div
            className="
                group
                rounded-[22px]
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_8px_25px_rgba(15,35,65,0.045)]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_12px_30px_rgba(16,32,55,0.07)]
            "
        >

            <div className="flex items-start justify-between">

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${iconClass}
                    `}
                >
                    <Icon size={17} />
                </div>

                <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition group-hover:text-slate-400" />

            </div>

            <div className="mt-6 min-w-0">

                <p className="text-xs font-medium text-slate-500">
                    {label}
                </p>

                <p
                    className="
                        mt-1.5
                        truncate
                        text-2xl
                        font-semibold
                        tracking-[-0.04em]
                        text-slate-950
                    "
                >
                    {value}
                </p>

                <p className="mt-2 text-[10px] text-slate-400">
                    {description}
                </p>

            </div>

        </div>
    );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyStaffState({ hasSearch }) {
    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-16
                text-center
            "
        >

            <div
                className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-50
                    text-slate-400
                    ring-1
                    ring-slate-100
                "
            >
                <Users className="h-5 w-5" />
            </div>

            <h3
                className="
                    mt-4
                    text-sm
                    font-bold
                    text-slate-800
                "
            >
                No staff members found
            </h3>

            <p
                className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-400
                "
            >
                {hasSearch
                    ? "Try adjusting your search terms."
                    : "There are currently no visible staff members in your scope."}
            </p>

        </div>
    );
}


/* =====================================================
   LOADING SKELETON
===================================================== */

function StaffSkeleton() {
    return (
        <div className="divide-y divide-slate-100">

            {Array.from({ length: 6 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="
                            flex
                            items-center
                            gap-5
                            px-5
                            py-5
                        "
                    >

                        <div
                            className="
                                h-10
                                w-10
                                shrink-0
                                animate-pulse
                                rounded-xl
                                bg-slate-100
                            "
                        />

                        <div className="flex-1 space-y-2">

                            <div
                                className="
                                    h-3
                                    w-32
                                    animate-pulse
                                    rounded
                                    bg-slate-100
                                "
                            />

                            <div
                                className="
                                    h-2.5
                                    w-20
                                    animate-pulse
                                    rounded
                                    bg-slate-50
                                "
                            />

                        </div>

                        <div
                            className="
                                hidden
                                h-3
                                w-44
                                animate-pulse
                                rounded
                                bg-slate-100
                                md:block
                            "
                        />

                        <div
                            className="
                                hidden
                                h-3
                                w-28
                                animate-pulse
                                rounded
                                bg-slate-100
                                lg:block
                            "
                        />

                    </div>
                )
            )}

        </div>
    );
}
