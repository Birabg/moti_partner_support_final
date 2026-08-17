import { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import { NotificationApi } from "../../api/notificationApi";
import { markNotificationRead } from "../../api/customerCaseApi";
import Axios from "../../api/axios";

export default function NotificationButton({ className = "", maxItems = 6 }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadNotifications();

    // Try Server-Sent Events first; fall back to polling if unavailable
    let es = null;
    let pollingId = null;
    let reconnectDelay = 1000;

    function startPolling() {
      if (pollingId) return;
      pollingId = window.setInterval(() => {
        if (!cancelled) loadNotifications();
      }, 15000);
    }

    function stopPolling() {
      if (pollingId) {
        window.clearInterval(pollingId);
        pollingId = null;
      }
    }

    async function startSSE() {
      try {
        // Attach access token as query parameter for EventSource since browsers do not allow setting headers on EventSource.
        const token = (() => { try { return localStorage.getItem("jwt_token"); } catch (e) { return null; } })();
        const baseUrl = Axios.defaults.baseURL || "";
        const streamBase = `${baseUrl}/notification/stream`;
        const streamUrl = token ? `${streamBase}?access_token=${encodeURIComponent(token)}` : streamBase;

      // Quick availability check: try a lightweight fetch first — if it responds OK, start SSE; otherwise fall back to polling.
      // This avoids a noisy 404 from EventSource in the console when the backend does not expose the stream endpoint.
      try {
        const resp = await fetch(streamUrl, { method: "GET", credentials: "include" });
        if (resp.ok) {
          es = new EventSource(streamUrl);
        } else {
          // Stream endpoint not available — fall back to polling
          startPolling();
        }
      } catch (fetchErr) {
        // Fetch failed (CORS or network) — fall back to polling
        startPolling();
      }

        es.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data);
            // On any incoming event, refresh list
            loadNotifications();
          } catch (err) {
            // ignore parse errors
            loadNotifications();
          }
        };

        es.onerror = () => {
          // SSE failed — close and fall back to polling with backoff
          if (es) {
            try { es.close(); } catch (e) {}
            es = null;
          }
          stopPolling();
          startPolling();
        };
      } catch (err) {
        // Could not create EventSource (likely not supported or CORS/headers)
        startPolling();
      }
    }

    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", onClickOutside);

    startSSE();

    return () => {
      cancelled = true;
      window.removeEventListener("click", onClickOutside);
      if (es) {
        try { es.close(); } catch (e) {}
        es = null;
      }
      stopPolling();
    };
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const resp = await NotificationApi.list(1, maxItems);
      // backend returns { message, data: { notifications, meta } }
      const payload = resp?.data?.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.notifications)
        ? payload.notifications
        : [];
      setNotifications(items);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className={`notification-wrapper ${className}`} ref={wrapperRef}>
      <button
        type="button"
        className="notification-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          if (!open) loadNotifications();
        }}
      >
        <FaBell />
        {!loading && unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>

          {loading ? (
            <p className="notification-empty-text">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="notification-empty-text">No notifications</p>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className={item.isRead || item.read ? "notification-item" : "notification-item unread"}>
                <div className="notification-content">
                  <p className="notification-message">{item.message}</p>
                  <p className="notification-time">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p>
                </div>
                {!item.isRead && !item.read && (
                  <div className="notification-actions">
                    <button className="notification-markread" onClick={() => handleMarkRead(item.id)}>Mark read</button>
                  </div>
                )}
              </div>
            ))
          )}

          <div className="customer-notification-footer">
            <Link to="/customer/notifications">View All Notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}
