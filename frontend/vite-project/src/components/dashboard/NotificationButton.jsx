import { useEffect, useRef, useState } from "react";
import {
    FaBell,
    FaCheck,
    FaCheckDouble,
    FaCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import { NotificationApi } from "../../api/notificationApi";
import { markNotificationRead } from "../../api/customerCaseApi";

import "../../styles/customerDashboard.css";

export default function NotificationButton({
    className = "",
    maxItems = 6,
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    const wrapperRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Load notifications
    |--------------------------------------------------------------------------
    */

    async function loadNotifications() {
        try {
            setLoading(true);

            const response = await NotificationApi.list(1, maxItems);

            const payload = response?.data?.data;

            const items = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.notifications)
                ? payload.notifications
                : [];

            setNotifications(items);
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Initial loading + polling
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        loadNotifications();

        const interval = window.setInterval(() => {
            if (!cancelled) {
                loadNotifications();
            }
        }, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [maxItems]);

    /*
    |--------------------------------------------------------------------------
    | Close dropdown when clicking outside
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Mark notification as read
    |--------------------------------------------------------------------------
    */

    async function handleMarkRead(id) {
        try {
            await markNotificationRead(id);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              isRead: true,
                              read: true,
                          }
                        : notification
                )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Mark all notifications as read
    |--------------------------------------------------------------------------
    */

    async function handleMarkAllRead() {
        const unread = notifications.filter(
            (notification) =>
                !notification.isRead &&
                !notification.read
        );

        if (unread.length === 0) {
            return;
        }

        try {
            await Promise.all(
                unread.map((notification) =>
                    markNotificationRead(notification.id)
                )
            );

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                    read: true,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const unreadCount = notifications.filter(
        (notification) =>
            !notification.isRead &&
            !notification.read
    ).length;

    function isUnread(notification) {
        return (
            !notification.isRead &&
            !notification.read
        );
    }

    function formatTime(date) {
        if (!date) {
            return "";
        }

        const notificationDate = new Date(date);
        const now = new Date();

        const difference =
            now.getTime() -
            notificationDate.getTime();

        const minutes = Math.floor(
            difference / (1000 * 60)
        );

        const hours = Math.floor(
            difference / (1000 * 60 * 60)
        );

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        if (minutes < 1) {
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

        return notificationDate.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric",
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className={`notification-wrapper ${className}`}
            ref={wrapperRef}
        >
            {/* Notification button */}

            <button
                type="button"
                className={`notification-btn ${
                    open ? "notification-btn-active" : ""
                }`}
                aria-label="Notifications"
                aria-expanded={open}
                onClick={(event) => {
                    event.stopPropagation();

                    setOpen((current) => !current);

                    if (!open) {
                        loadNotifications();
                    }
                }}
            >
                <FaBell />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}

            {open && (
                <div className="notification-dropdown">
                    {/* Header */}

                    <div className="notification-dropdown-header">
                        <div>
                            <div className="notification-dropdown-title">
                                Notifications

                                {unreadCount > 0 && (
                                    <span className="notification-header-count">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            <p className="notification-dropdown-subtitle">
                                {unreadCount > 0
                                    ? `${unreadCount} unread ${
                                          unreadCount === 1
                                              ? "notification"
                                              : "notifications"
                                      }`
                                    : "You're all caught up"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="notification-mark-all"
                                onClick={
                                    handleMarkAllRead
                                }
                            >
                                <FaCheckDouble />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification body */}

                    <div className="notification-dropdown-body">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="notification-spinner" />

                                <span>
                                    Loading notifications...
                                </span>
                            </div>
                        ) : notifications.length ===
                          0 ? (
                            <div className="notification-empty">
                                <div className="notification-empty-icon">
                                    <FaBell />
                                </div>

                                <h4>
                                    No notifications
                                </h4>

                                <p>
                                    You're all caught up.
                                    New updates will appear
                                    here.
                                </p>
                            </div>
                        ) : (
                            notifications.map(
                                (notification) => {
                                    const unread =
                                        isUnread(
                                            notification
                                        );

                                    return (
                                        <div
                                            key={
                                                notification.id
                                            }
                                            className={`notification-item ${
                                                unread
                                                    ? "notification-item-unread"
                                                    : ""
                                            }`}
                                        >
                                            {/* Left indicator */}

                                            <div className="notification-item-icon">
                                                <FaBell />
                                            </div>

                                            {/* Content */}

                                            <div className="notification-item-content">
                                                <p className="notification-message">
                                                    {
                                                        notification.message
                                                    }
                                                </p>

                                                <div className="notification-meta">
                                                    <span>
                                                        {formatTime(
                                                            notification.createdAt
                                                        )}
                                                    </span>

                                                    {unread && (
                                                        <>
                                                            <FaCircle className="notification-meta-dot" />

                                                            <span className="notification-new">
                                                                New
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Read button */}

                                            {unread && (
                                                <button
                                                    type="button"
                                                    className="notification-read-btn"
                                                    title="Mark as read"
                                                    aria-label="Mark notification as read"
                                                    onClick={() =>
                                                        handleMarkRead(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                        </div>
                                    );
                                }
                            )
                        )}
                    </div>

                    {/* Footer */}

                    <div className="notification-dropdown-footer">
                        <Link
                            to="/customer/notifications"
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}