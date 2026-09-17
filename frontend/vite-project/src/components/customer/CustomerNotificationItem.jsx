import {
    FaBell,
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaClock,
    FaArrowRight,
} from "react-icons/fa";

export default function CustomerNotificationItem({
    notification,
}) {
    function getNotificationConfig(type) {
        switch (type) {
            case "CASE_ASSIGNED":
                return {
                    icon: FaBell,
                    label: "Case Assigned",
                    iconBg: "bg-blue-50",
                    iconColor: "text-blue-600",
                    accent: "bg-blue-500",
                };

            case "CASE_RESOLVED":
                return {
                    icon: FaCheckCircle,
                    label: "Case Resolved",
                    iconBg: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    accent: "bg-emerald-500",
                };

            case "CASE_REASSIGNED":
                return {
                    icon: FaExclamationCircle,
                    label: "Case Reassigned",
                    iconBg: "bg-amber-50",
                    iconColor: "text-amber-600",
                    accent: "bg-amber-500",
                };

            case "CASE_CLOSED":
                return {
                    icon: FaCheckCircle,
                    label: "Case Closed",
                    iconBg: "bg-slate-100",
                    iconColor: "text-slate-600",
                    accent: "bg-slate-500",
                };

            default:
                return {
                    icon: FaInfoCircle,
                    label: "Notification",
                    iconBg: "bg-indigo-50",
                    iconColor: "text-indigo-600",
                    accent: "bg-indigo-500",
                };
        }
    }

    function formatDate(date) {
        if (!date) return "";

        const notificationDate = new Date(date);

        if (Number.isNaN(notificationDate.getTime())) {
            return "";
        }

        return notificationDate.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatRelativeTime(date) {
        if (!date) return "";

        const notificationDate = new Date(date);

        if (Number.isNaN(notificationDate.getTime())) {
            return "";
        }

        const now = new Date();
        const difference =
            now.getTime() - notificationDate.getTime();

        const seconds = Math.floor(difference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        if (hours < 24) {
            return `${hours}h ago`;
        }

        if (days < 7) {
            return `${days}d ago`;
        }

        return notificationDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    const config = getNotificationConfig(
        notification?.type
    );

    const Icon = config.icon;

    const isUnread = !notification?.read;

    return (
        <div
            className={`
                group
                relative
                flex
                gap-4
                px-5
                py-4
                border-b
                border-slate-100
                transition-all
                duration-200
                cursor-pointer

                ${
                    isUnread
                        ? "bg-blue-50/40 hover:bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                }
            `}
        >

            {/* UNREAD ACCENT */}
            {isUnread && (
                <div
                    className={`
                        absolute
                        left-0
                        top-0
                        bottom-0
                        w-1
                        ${config.accent}
                    `}
                />
            )}

            {/* ICON */}
            <div className="shrink-0">

                <div
                    className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-2xl
                        ${config.iconBg}
                        ${config.iconColor}
                        transition-transform
                        duration-200
                        group-hover:scale-105
                    `}
                >
                    <Icon className="text-lg" />
                </div>

            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">

                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                        <div className="flex items-center gap-2">

                            <p
                                className={`
                                    truncate
                                    text-sm
                                    ${
                                        isUnread
                                            ? "font-bold text-slate-900"
                                            : "font-semibold text-slate-700"
                                    }
                                `}
                            >
                                {config.label}
                            </p>

                            {isUnread && (
                                <span
                                    className="
                                        inline-flex
                                        h-1.5
                                        w-1.5
                                        shrink-0
                                        rounded-full
                                        bg-blue-500
                                    "
                                />
                            )}

                        </div>

                    </div>

                    {/* RELATIVE TIME */}
                    <span
                        className="
                            shrink-0
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                        title={formatDate(notification?.createdAt)}
                    >
                        {formatRelativeTime(
                            notification?.createdAt
                        )}
                    </span>

                </div>

                {/* MESSAGE */}
                <p
                    className={`
                        mt-1.5
                        text-sm
                        leading-6
                        ${
                            isUnread
                                ? "text-slate-700"
                                : "text-slate-500"
                        }
                    `}
                >
                    {notification?.message ||
                        "You have a new notification."}
                </p>

                {/* FOOTER */}
                <div
                    className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >
                        <FaClock className="text-[10px]" />

                        <span>
                            {formatDate(
                                notification?.createdAt
                            )}
                        </span>
                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-1
                            text-xs
                            font-semibold
                            text-slate-400
                            opacity-0
                            transition-all
                            duration-200
                            group-hover:translate-x-0
                            group-hover:opacity-100
                        "
                    >
                        <span>View</span>

                        <FaArrowRight className="text-[10px]" />
                    </div>

                </div>

            </div>

        </div>
    );
}
