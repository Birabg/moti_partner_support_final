import { useEffect, useState } from "react";
import { FaBell, FaCheckCircle, FaRegBell } from "react-icons/fa";

import { CustomerApi } from "../../api/customerApi";
import { markNotificationRead } from "../../api/customerCaseApi";

export default function CustomerNotifications() {
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            const response = await CustomerApi.notifications();
            const items =
                response.data?.data?.notifications ||
                response.data?.data ||
                response.data?.notifications ||
                response.data ||
                [];

            setNotifications(Array.isArray(items) ? items : []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkRead(notificationId) {
        try {
            setSavingId(notificationId);
            await markNotificationRead(notificationId);
            await loadNotifications();
        } catch (error) {
            console.log(error);
        } finally {
            setSavingId(null);
        }
    }

    if (loading) {
        return <div className="customer-loading">Loading Notifications...</div>;
    }

    return (
        <div className="customer-dashboard">
            <div className="customer-form">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <FaBell size={32} color="#1a345b" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
                        <p className="text-sm text-slate-500 mt-1">Review updates related to your support cases.</p>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="customer-empty-state">
                        <FaRegBell size={36} />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {notification.title || "Notification"}
                                    </p>
                                    <p className="text-slate-600 mt-1">
                                        {notification.message}
                                    </p>
                                    {notification.createdAt && (
                                        <p className="text-xs text-slate-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {!notification.isRead && (
                                    <button
                                        type="button"
                                        onClick={() => handleMarkRead(notification.id)}
                                        disabled={savingId === notification.id}
                                        className="customer-btn customer-btn-primary inline-flex items-center gap-2"
                                    >
                                        <FaCheckCircle />
                                        {savingId === notification.id ? "Saving..." : "Mark Read"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
