import { FaUserCircle } from "react-icons/fa";

export default function CustomerHeader({
    customer,
    displayName,
}) {
    const name =
        displayName ||
        customer?.firstName ||
        "Customer";

    const initials = name
        .trim()
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                {initials || <FaUserCircle />}
            </div>

            {/* Header text */}
            <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Customer Portal
                </p>

                <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
                    Dashboard
                </h1>

            </div>

        </div>
    );
}