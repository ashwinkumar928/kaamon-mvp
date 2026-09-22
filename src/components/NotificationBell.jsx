import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./NotificationBell.css";

const icons = {
  new_application: "↗", application_accepted: "✓", application_rejected: "–",
  application_completed: "✓", new_message: "✉", new_review: "★",
};

// Only allow the app routes that notification producers use.
function notificationLink(link) {
  return typeof link === "string" && /^(\/my-applications|\/profile|\/jobs\/\d+\/applicants|\/applications\/\d+\/chat)$/.test(link)
    ? link : null;
}

export default function NotificationBell({ token }) {
  const navigate = useNavigate();
  const panelId = useId();
  const root = useRef(null);
  const bell = useRef(null);
  const controller = useRef(null);
  const version = useRef(0);
  const fetching = useRef(false);
  const mutating = useRef(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || fetching.current || mutating.current) return;
    const signal = controller.current?.signal;
    if (!signal || signal.aborted) return;
    const requestVersion = ++version.current;
    fetching.current = true;
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }, signal,
      });
      if (!response.ok) throw new Error("Could not load notifications.");
      const result = await response.json();
      if (!signal.aborted && requestVersion === version.current) {
        setData(result);
        setError("");
      }
    } catch (failure) {
      if (!signal.aborted && requestVersion === version.current) setError(failure.message);
    } finally {
      if (!signal.aborted) fetching.current = false;
    }
  }, [token]);

  useEffect(() => {
    controller.current = new AbortController();
    fetching.current = false;
    void refresh();
    const interval = window.setInterval(refresh, 20000);
    return () => {
      window.clearInterval(interval);
      controller.current.abort();
      version.current += 1;
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        bell.current?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function markRead(notification) {
    if (mutating.current) return;
    const signal = controller.current.signal;
    mutating.current = true;
    version.current += 1; // Ignore any GET that started before this update.
    setBusy(true);
    setError("");
    try {
      if (!notification?.is_read) {
        const suffix = notification ? `${notification.id}/read` : "read-all";
        const response = await fetch(`${API_URL}/api/notifications/${suffix}`, {
          method: "PATCH", headers: { Authorization: `Bearer ${token}` }, signal,
        });
        if (!response.ok) throw new Error("Could not mark notifications as read. Please try again.");
        if (signal.aborted) return;
        setData((current) => current && ({
          unreadCount: notification ? Math.max(0, current.unreadCount - 1) : 0,
          notifications: current.notifications.map((item) =>
            !notification || item.id === notification.id ? { ...item, is_read: true } : item),
        }));
      }
      if (signal.aborted) return;
      if (notification) {
        setOpen(false);
        bell.current?.focus();
        const link = notificationLink(notification.link);
        if (link) navigate(link);
      }
    } catch (failure) {
      if (!signal.aborted) setError(failure.message);
    } finally {
      mutating.current = false;
      if (!signal.aborted) {
        setBusy(false);
        void refresh();
      }
    }
  }

  const unreadCount = data?.unreadCount || 0;
  return (
    <div className="notifications" ref={root}>
      <button type="button" className="notification-bell" ref={bell}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open} aria-controls={open ? panelId : undefined}
        onClick={() => { setOpen(!open); if (!open) void refresh(); }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && <span className="notification-badge" aria-hidden="true">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <section className="notification-panel" id={panelId} aria-label="Notifications" aria-busy={busy}>
          <div className="notification-header">
            <strong>Notifications</strong>
            <button type="button" disabled={!unreadCount || busy} onClick={() => markRead(null)}>Mark all as read</button>
          </div>
          {error && <div className="notification-error" role="alert">{error} <button type="button" disabled={busy} onClick={refresh}>Retry</button></div>}
          {!data && !error && <p className="notification-empty" role="status">Loading notifications…</p>}
          {data?.notifications.length === 0 && <div className="notification-empty">
            <strong>No notifications yet</strong>
            <p>Updates about your work and applications will appear here.</p>
          </div>}
          {data?.notifications.length > 0 && <ul className="notification-list">
            {data.notifications.map((item) => (
              <li key={item.id}>
                <button type="button" disabled={busy} onClick={() => markRead(item)}
                  className={`notification-item${item.is_read ? "" : " notification-unread"}`}>
                  <span className="notification-icon" aria-hidden="true">{icons[item.type] || "•"}</span>
                  <span className="notification-copy">
                    <strong>{item.title}</strong>
                    {item.message && <span>{item.message}</span>}
                    <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                  </span>
                  {!item.is_read && <span className="notification-dot" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>}
        </section>
      )}
    </div>
  );
}
