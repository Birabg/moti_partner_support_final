import { useState, useRef, useEffect } from "react";
import {
    PanelLeft,
    LogOut,
    User as UserIcon,
    ChevronDown,
    ShieldCheck,
    CircleHelp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import NotificationButton from "../dashboard/NotificationButton";

function profilePath(user) {
    if (
        user?.isManager &&
        !user?.isSAdmin &&
        !user?.isPSsupport
    ) {
        return "/manager/profile";
    }

    if (
        user?.isDirector &&
        !user?.isSAdmin &&
        !user?.isPSsupport
    ) {
        return "/director/profile";
    }

    if (user?.isPSsupport) {
        return "/support/profile";
    }

    return "/profile";
}

function roleLabel(user) {
    if (user?.isSAdmin) return "System Administrator";
    if (user?.isDirector) return "Director";
    if (user?.isManager) return "Manager";
    if (user?.isPSsupport) return "PS Support";

    if (
        user?.partyType === "CUSTOMER" ||
        user?.isCustomer
    ) {
        return "Customer";
    }

    return "Portal User";
}

export default function Header({
    collapsed,
    onToggle,
}) {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const handleLogout = async () => {
        try {
            if (typeof logout === "function") {
                await logout();
            }
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("jwt_token");
            navigate("/login");
        }
    };

    const initials =
        `${user?.firstName?.[0] || ""}${
            user?.middleName?.[0] ||
            user?.lastName?.[0] ||
            ""
        }`.toUpperCase() || "U";

    const fullName =
        [user?.firstName, user?.middleName, user?.lastName]
            .filter(Boolean)
            .join(" ") || "Portal User";

    const role = roleLabel(user);

    return (
        <header
            className="
                sticky top-0 z-40
                flex h-[72px]
                items-center
                border-b border-slate-200/80
                bg-white/90
                px-4
                backdrop-blur-xl
                sm:px-6
                lg:px-7
            "
        >
            {/* =================================================
                LEFT
            ================================================= */}
            <div className="flex min-w-0 items-center gap-3">

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-xl
                        border border-slate-200
                        bg-white
                        text-slate-500
                        shadow-[0_3px_12px_rgba(16,32,55,0.035)]
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-slate-300
                        hover:bg-slate-50
                        hover:text-[#1a345b]
                    "
                >
                    <PanelLeft className="h-[15px] w-[15px]" />
                </button>

                <div className="hidden h-6 w-px bg-slate-200 sm:block" />

                <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
                        MOTI Partner Support
                    </p>

                    <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-600">
                        Enterprise workspace
                    </p>
                </div>
            </div>

            {/* =================================================
                RIGHT
            ================================================= */}
            <div className="ml-auto flex items-center gap-2.5">

                {/* Platform status */}
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />

                    <span className="text-[9px] font-semibold text-slate-400">
                        Operational
                    </span>
                </div>

                {/* Help */}
                <button
                    type="button"
                    title="Help"
                    className="
                        hidden h-9 w-9
                        items-center justify-center
                        rounded-xl
                        border border-slate-200
                        bg-white
                        text-slate-400
                        transition-all duration-200
                        hover:border-slate-300
                        hover:bg-slate-50
                        hover:text-[#527eb9]
                        lg:flex
                    "
                >
                    <CircleHelp size={15} />
                </button>

                {/* Notifications */}
                <div
                    className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        border border-slate-200
                        bg-white
                    "
                >
                    <NotificationButton />
                </div>

                {/* Divider */}
                <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

                {/* =================================================
                    PROFILE
                ================================================= */}
                <div
                    className="relative"
                    ref={menuRef}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen((value) => !value)
                        }
                        className="
                            group
                            flex items-center gap-2.5
                            rounded-xl
                            border border-transparent
                            px-1.5 py-1
                            transition-all duration-200
                            hover:border-slate-200
                            hover:bg-slate-50
                        "
                    >
                        {/* Avatar */}
                        <div
                            className="
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-[#1a345b]
                                text-[11px]
                                font-bold
                                text-white
                                shadow-[0_6px_16px_rgba(26,52,91,0.16)]
                            "
                        >
                            {initials}
                        </div>

                        {/* User info */}
                        <div className="hidden min-w-0 text-left sm:block">

                            <p className="max-w-[150px] truncate text-[11px] font-bold text-[#101a28]">
                                {fullName}
                            </p>

                            <div className="mt-0.5 flex items-center gap-1.5">
                                <ShieldCheck
                                    size={9}
                                    className="text-[#567fbd]"
                                />

                                <p className="max-w-[150px] truncate text-[9px] font-medium text-slate-400">
                                    {role}
                                </p>
                            </div>
                        </div>

                        <ChevronDown
                            className={`
                                h-3.5 w-3.5
                                text-slate-300
                                transition-transform duration-200
                                ${
                                    menuOpen
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />
                    </button>

                    {/* =================================================
                        PROFILE MENU
                    ================================================= */}
                    {menuOpen && (
                        <div
                            className="
                                absolute right-0 mt-3 w-[245px]
                                overflow-hidden
                                rounded-2xl
                                border border-slate-200
                                bg-white
                                shadow-[0_20px_50px_rgba(16,32,55,0.12)]
                            "
                        >
                            {/* User summary */}
                            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a345b] text-[11px] font-bold text-white">
                                        {initials}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold text-[#101a28]">
                                            {fullName}
                                        </p>

                                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                                            {user?.email || ""}
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {/* Profile */}
                            <div className="p-2">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate(
                                            profilePath(user)
                                        );
                                    }}
                                    className="
                                        flex w-full items-center gap-3
                                        rounded-xl
                                        px-3 py-2.5
                                        text-left
                                        text-[11px] font-semibold
                                        text-slate-600
                                        transition-colors
                                        hover:bg-slate-50
                                        hover:text-[#1a345b]
                                    "
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                        <UserIcon size={13} />
                                    </span>

                                    Profile
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="
                                        flex w-full items-center gap-3
                                        rounded-xl
                                        px-3 py-2.5
                                        text-left
                                        text-[11px] font-semibold
                                        text-red-500
                                        transition-colors
                                        hover:bg-red-50
                                    "
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                                        <LogOut size={13} />
                                    </span>

                                    Sign out
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
