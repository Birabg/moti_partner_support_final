import { useEffect, useRef } from "react";
import {
    FaBell,
    FaCheck,
} from "react-icons/fa";

import CustomerNotificationItem from "./CustomerNotificationItem";

import "../../styles/customerDashboard.css";

export default function NotificationDropdown({
    notifications = [],
    open,
    onClose,
    onViewAll,
}) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                onClose();
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            ref={dropdownRef}
            className="customer-notification-dropdown"
            role="dialog"
            aria-label="Notifications"
        >
            {/* Header */}
            <div className="customer-notification-header">

                <div className="notification-header-left">

                    <div className="notification-header-icon">
                        <FaBell />
                    </div>

                    <div className="notification-header-content">
                        <h3>Notifications</h3>

                        <span>
                            {notifications.length === 0
                                ? "You're all caught up"
                                : `${notifications.length} ${
                                      notifications.length === 1
                                          ? "notification"
                                          : "notifications"
                                  }`}
                        </span>
                    </div>

                </div>

                {notifications.length > 0 && (
                    <div className="notification-count">
                        {notifications.length}
                    </div>
                )}

            </div>

            {/* Body */}
            <div className="customer-notification-body">

                {notifications.length === 0 ? (
                    <div className="notification-empty">

                        <div className="notification-empty-icon">
                            <FaCheck />
                        </div>

                        <h4>No new notifications</h4>

                        <p>
                            You're all caught up. We'll let you know
                            when something needs your attention.
                        </p>

                    </div>
                ) : (
                    <div className="notification-list">

                        {notifications.map((notification) => (
                            <CustomerNotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}

                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="customer-notification-footer">

                <button
                    type="button"
                    className="customer-notification-view-all"
                    onClick={onViewAll}
                >
                    <span>View all notifications</span>

                    <span className="notification-arrow">
                        →
                    </span>
                </button>

            </div>

        </div>
    );
}