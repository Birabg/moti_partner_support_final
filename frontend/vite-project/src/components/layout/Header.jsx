import { useState, useRef, useEffect } from "react";
import { PanelLeft, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import NotificationButton from "../dashboard/NotificationButton";

function profilePath(user) {
    if (user?.isManager && !user?.isSAdmin && !user?.isPSsupport) return "/manager/profile";
    if (user?.isDirector && !user?.isSAdmin && !user?.isPSsupport) return "/director/profile";
    if (user?.isPSsupport) return "/support/profile";
    return "/profile";
}

function roleLabel(user) {
    if (user?.isSAdmin) return "System Administrator";
    if (user?.isDirector) return "Director";
    if (user?.isManager) return "Manager";
    if (user?.isPSsupport) return "PS Support";
    if (user?.partyType === "CUSTOMER" || user?.isCustomer) return "Customer";
    return "";
}

export default function Header({ collapsed, onToggle }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function onClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    const initials =
        `${user?.firstName?.[0] || ""}${user?.middleName?.[0] || user?.lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur sm:gap-4">
            <button
                type="button"
                onClick={onToggle}
                aria-label="Toggle sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-navy-200 text-slate-500 hover:bg-navy-50 hover:text-navy-700 transition"
            >
                <PanelLeft className="h-4 w-4" />
            </button>
            <div className="h-6 w-px bg-navy-100" />

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <NotificationButton />

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-navy-50 transition"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                            {initials}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium leading-tight text-slate-800">
                                {user?.firstName} {user?.middleName}
                            </p>
                            <p className="text-xs leading-tight text-slate-400">{roleLabel(user)}</p>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md border border-navy-100 bg-white py-1 shadow-md">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate(profilePath(user));
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-navy-50"
                            >
                                <UserIcon className="h-4 w-4" />
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
