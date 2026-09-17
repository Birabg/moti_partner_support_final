import { useEffect, useMemo, useState } from "react";
import {
    FaArrowRight,
    FaArrowUp,
    FaBuilding,
    FaEnvelope,
    FaExclamationTriangle,
    FaSearch,
    FaShieldAlt,
    FaUser,
    FaUserTie,
    FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { directorApi } from "../../api/directorApi";

export default function DirectorUsers() {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            try {
                setLoading(true);
                setError("");

                const response = await directorApi.getUsersOverview();

                if (!isMounted) return;

                const list = response?.data?.data || [];
                const count = response?.data?.count ?? list.length;

                setUsers(list);
                setTotalUsers(count);
            } catch (caughtError) {
                console.error("Director users load error", caughtError);

                const apiMessage =
                    caughtError?.response?.data?.message ||
                    caughtError?.response?.data ||
                    caughtError?.message ||
                    "Unable to load users.";

                if (isMounted) {
                    setError(String(apiMessage));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    /*
    ============================================================
    USER ROLE
    ============================================================
    */

    function getUserRole(user) {
        if (user?.roleInfo?.isDirector) return "Director";
        if (user?.roleInfo?.isManager) return "Manager";
        if (user?.roleInfo?.isPSsupport) return "Support";

        return "Customer";
    }

    /*
    ============================================================
    USER TYPE
    ============================================================
    */

    function getUserType(user) {
        return user?.userType || "STAFF";
    }

    /*
    ============================================================
    USER NAME
    ============================================================
    */

    function getUserName(user) {
        const fullName = [
            user?.firstName,
            user?.middleName,
            user?.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return fullName || user?.email || "Unknown User";
    }

    /*
    ============================================================
    FILTERED USERS
    ============================================================
    */

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const name = getUserName(user).toLowerCase();
            const email = String(user?.email || "").toLowerCase();
            const type = getUserType(user).toLowerCase();
            const role = getUserRole(user).toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                type.includes(query) ||
                role.includes(query);

            const matchesRole =
                roleFilter === "ALL" ||
                getUserRole(user).toUpperCase() === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    /*
    ============================================================
    USER STATISTICS
    ============================================================
    */

    const userStats = useMemo(() => {
        const directors = users.filter(
            (user) => getUserRole(user) === "Director"
        ).length;

        const managers = users.filter(
            (user) => getUserRole(user) === "Manager"
        ).length;

        const support = users.filter(
            (user) => getUserRole(user) === "Support"
        ).length;

        const customers = users.filter(
            (user) => getUserRole(user) === "Customer"
        ).length;

        return {
            directors,
            managers,
            support,
            customers,
        };
    }, [users]);

    /*
    ============================================================
    LOADING STATE
    ============================================================
    */

    if (loading && users.length === 0) {
        return (
            <div className="min-h-full space-y-7">

                <div className="h-[230px] animate-pulse rounded-[24px] bg-[#0b1b33]" />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-[150px] animate-pulse rounded-[20px] border border-slate-200 bg-white"
                        />
                    ))}
                </div>

                <div className="h-[600px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />

            </div>
        );
    }

    return (
        <div className="min-h-full space-y-7">

            {/* ======================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

                <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#416da8]/20 blur-[95px]" />

                <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[380px] w-[380px] rounded-full bg-[#658abd]/10 blur-[100px]" />

                <div
                    className="
                        pointer-events-none absolute inset-0 opacity-[0.045]
                        [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
                        [background-size:36px_36px]
                    "
                />

                <div className="relative z-10 px-6 py-8 sm:px-9 sm:py-10">

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-2xl">

                            <div className="mb-5 flex items-center gap-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                                    User Management
                                </span>

                            </div>

                            <h1 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                                Users Overview
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                                Monitor active users across the MOTI Partner
                                Support Platform, review roles, and understand
                                the current user structure.
                            </p>

                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:flex">

                            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                                    Total users
                                </p>

                                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                                    {totalUsers}
                                </p>

                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                                    Showing
                                </p>

                                <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
                                    {filteredUsers.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* ======================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

                    <FaExclamationTriangle className="mt-0.5 shrink-0" />

                    <div>

                        <p className="font-semibold">
                            User data unavailable
                        </p>

                        <p className="mt-1 text-xs text-red-600/80">
                            {error}
                        </p>

                    </div>

                </div>
            )}

            {/* ======================================================
                USER KPIs
            ====================================================== */}

            <section>

                <div className="mb-4 flex items-end justify-between">

                    <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                            Organization
                        </p>

                        <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                            User structure at a glance
                        </h2>

                    </div>

                    <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        Live overview

                    </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <UserMetric
                        label="Total Users"
                        value={totalUsers}
                        description="Active users across the platform"
                        icon={FaUsers}
                        tone="blue"
                    />

                    <UserMetric
                        label="Directors"
                        value={userStats.directors}
                        description="Executive-level accounts"
                        icon={FaShieldAlt}
                        tone="blue"
                    />

                    <UserMetric
                        label="Managers"
                        value={userStats.managers}
                        description="Manager-level accounts"
                        icon={FaUserTie}
                        tone="amber"
                    />

                    <UserMetric
                        label="Support"
                        value={userStats.support}
                        description="Support team accounts"
                        icon={FaUser}
                        tone="green"
                    />

                </div>

            </section>

            {/* ======================================================
                USER DIRECTORY
            ====================================================== */}

            <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

                {/* HEADER */}

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">

                                    <FaUsers className="text-sm" />

                                </div>

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Directory
                                    </p>

                                    <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                                        Active users
                                    </h2>

                                </div>

                            </div>

                            <p className="mt-3 text-[11px] leading-5 text-slate-400">
                                Browse users, roles, account types, and
                                contact information.
                            </p>

                        </div>

                        {/* SEARCH */}

                        <div className="relative w-full lg:w-[300px]">

                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search users..."
                                className="
                                    h-10 w-full rounded-xl
                                    border border-slate-200
                                    bg-slate-50
                                    pl-9 pr-4
                                    text-xs text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-[#527eb9]
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-[#527eb9]/10
                                "
                            />

                        </div>

                    </div>

                    {/* FILTERS */}

                    <div className="mt-5 flex flex-wrap gap-2">

                        {[
                            ["ALL", "All Users"],
                            ["DIRECTOR", "Directors"],
                            ["MANAGER", "Managers"],
                            ["SUPPORT", "Support"],
                            ["CUSTOMER", "Customers"],
                        ].map(([value, label]) => (

                            <button
                                key={value}
                                type="button"
                                onClick={() => setRoleFilter(value)}
                                className={`
                                    rounded-full px-3 py-1.5
                                    text-[9px] font-bold
                                    transition
                                    ${
                                        roleFilter === value
                                            ? "bg-[#0b1b33] text-white"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }
                                `}
                            >
                                {label}
                            </button>

                        ))}

                    </div>

                </div>

                {/* TABLE */}

                {filteredUsers.length === 0 ? (

                    <div className="px-6 py-14 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300">

                            <FaUsers />

                        </div>

                        <p className="mt-3 text-[11px] font-semibold text-slate-500">
                            No users found
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                            Try changing your search or role filter.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px]">

                            <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/50">

                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        User
                                    </th>

                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Contact
                                    </th>

                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        User Type
                                    </th>

                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Role
                                    </th>

                                    <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredUsers.map((user, index) => {

                                    const name = getUserName(user);
                                    const role = getUserRole(user);
                                    const type = getUserType(user);

                                    return (

                                        <tr
                                            key={
                                                user.id ||
                                                user.email ||
                                                index
                                            }
                                            className="group transition-colors hover:bg-slate-50/60"
                                        >

                                            {/* USER */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4fd] text-sm font-bold text-[#527eb9]">

                                                        {name
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <p className="text-[11px] font-bold text-[#101a28]">
                                                            {name}
                                                        </p>

                                                        <p className="mt-0.5 text-[9px] text-slate-400">
                                                            User account
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* CONTACT */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-2">

                                                    <FaEnvelope className="text-[10px] text-slate-300" />

                                                    <span className="text-[10px] text-slate-500">
                                                        {user.email ||
                                                            "No email"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* USER TYPE */}

                                            <td className="px-6 py-4">

                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">

                                                    {type}

                                                </span>

                                            </td>

                                            {/* ROLE */}

                                            <td className="px-6 py-4">

                                                <RoleBadge role={role} />

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-4 text-right">

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf8f4] px-2.5 py-1 text-[9px] font-bold text-[#37876c]">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#37876c]" />

                                                    Active

                                                </span>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

                {/* TABLE FOOTER */}

                {filteredUsers.length > 0 && (

                    <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-[10px] text-slate-400">

                            Showing{" "}

                            <span className="font-bold text-slate-600">
                                {filteredUsers.length}
                            </span>{" "}

                            of{" "}

                            <span className="font-bold text-slate-600">
                                {totalUsers}
                            </span>{" "}

                            users

                        </p>

                        <p className="text-[10px] text-slate-400">
                            User directory
                        </p>

                    </div>

                )}

            </section>

            {/* ======================================================
                MANAGEMENT TOOLS
            ====================================================== */}

            <section>

                <div className="mb-4">

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
                        Management
                    </p>

                    <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                        User management tools
                    </h2>

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    <ManagementCard
                        to="/director/department-management"
                        icon={FaBuilding}
                        label="Departments"
                        description="Manage the organizational structure and hierarchy."
                    />

                    <ManagementCard
                        to="/director/case-analytics"
                        icon={FaArrowRight}
                        label="Case Analytics"
                        description="Review support activity and organization performance."
                    />

                </div>

            </section>

            {/* ======================================================
                FOOTER
            ====================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">

                    <FaUsers className="text-[#567fbd]" />

                    MOTI Partner Support Platform

                </div>

                <div>
                    Executive user management workspace
                </div>

            </div>

        </div>
    );
}

/*
============================================================
USER METRIC
============================================================
*/

function UserMetric({
    label,
    value,
    description,
    icon: Icon,
    tone = "blue",
}) {
    const tones = {
        blue: {
            icon: "bg-[#edf4fd] text-[#527eb9]",
            line: "bg-[#527eb9]",
        },

        green: {
            icon: "bg-[#edf8f4] text-[#37876c]",
            line: "bg-[#37876c]",
        },

        amber: {
            icon: "bg-[#fff7e8] text-[#c58a27]",
            line: "bg-[#c58a27]",
        },
    };

    const currentTone = tones[tone] || tones.blue;

    return (
        <div
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

            <div
                className={`
                    absolute left-0 top-0
                    h-[3px] w-0
                    ${currentTone.line}
                    transition-all duration-300
                    group-hover:w-full
                `}
            />

            <div className="flex items-start justify-between">

                <div
                    className={`
                        flex h-10 w-10 items-center justify-center
                        rounded-xl
                        ${currentTone.icon}
                    `}
                >
                    <Icon className="text-sm" />
                </div>

                <FaArrowUp className="rotate-45 text-[10px] text-slate-300" />

            </div>

            <div className="mt-6">

                <p className="text-[10px] font-medium text-slate-400">
                    {label}
                </p>

                <p className="mt-1.5 font-display text-[30px] font-bold tracking-[-0.045em] text-[#101a28]">
                    {value}
                </p>

                <p className="mt-2 text-[10px] text-slate-400">
                    {description}
                </p>

            </div>

        </div>
    );
}

/*
============================================================
ROLE BADGE
============================================================
*/

function RoleBadge({ role }) {
    const config = {
        Director: {
            background: "bg-[#edf4fd]",
            text: "text-[#527eb9]",
            dot: "bg-[#527eb9]",
        },

        Manager: {
            background: "bg-[#fff7e8]",
            text: "text-[#c58a27]",
            dot: "bg-[#c58a27]",
        },

        Support: {
            background: "bg-[#edf8f4]",
            text: "text-[#37876c]",
            dot: "bg-[#37876c]",
        },

        Customer: {
            background: "bg-slate-100",
            text: "text-slate-500",
            dot: "bg-slate-400",
        },
    };

    const current = config[role] || config.Customer;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full
                px-2.5 py-1
                text-[9px] font-bold
                ${current.background}
                ${current.text}
            `}
        >

            <span
                className={`h-1.5 w-1.5 rounded-full ${current.dot}`}
            />

            {role}

        </span>
    );
}

/*
============================================================
MANAGEMENT CARD
============================================================
*/

function ManagementCard({
    to,
    icon: Icon,
    label,
    description,
}) {
    return (
        <Link
            to={to}
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

            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#edf4fd] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10">

                <div className="flex items-start justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">

                        <Icon className="text-sm" />

                    </div>

                    <FaArrowUp className="rotate-45 text-xs text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#527eb9]" />

                </div>

                <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Director tool
                </p>

                <h3 className="mt-1.5 text-sm font-bold text-[#101a28]">
                    {label}
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    {description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-[10px] font-bold text-[#527eb9]">

                    Open workspace

                    <FaArrowRight className="text-[9px] transition-transform group-hover:translate-x-0.5" />

                </div>

            </div>

        </Link>
    );
}
