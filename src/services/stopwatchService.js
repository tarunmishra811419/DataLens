// stopwatchService.js
// Persists daily time-tracking sessions with local storage & cloud database sync.

const STORAGE_KEY = "datalens_stopwatch_sessions";
const API_BASE_URL =
    (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/time-sessions";

function getAuthToken() {
    const token =
        localStorage.getItem("datalens_token") ||
        sessionStorage.getItem("datalens_token");
    if (token && !token.startsWith("demo-")) {
        return token;
    }
    return null;
}

export function getTodayKey(ts = Date.now()) {
    return new Date(ts).toISOString().split("T")[0];
}

export function getAllSessions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

/**
 * Syncs time sessions with the backend database.
 * Merges cloud data with local records so user never loses tracked time.
 */
export async function syncTimeSessionsWithBackend() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const res = await fetch(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) return;

        const data = await res.json();
        const remoteMap = data.sessionsMap || {};

        const localMap = getAllSessions();
        let changed = false;

        // Merge: take maximum of local or remote for each date
        const merged = { ...localMap };
        for (const [date, seconds] of Object.entries(remoteMap)) {
            if ((merged[date] || 0) < seconds) {
                merged[date] = seconds;
                changed = true;
            }
        }

        if (changed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            window.dispatchEvent(new Event("datalens_stopwatch_updated"));
        }
    } catch {
        // Graceful offline fallback
    }
}

export function addSecondsToDay(seconds, dayKey = getTodayKey()) {
    const rounded = Math.round(seconds);
    if (rounded <= 0) return 0;

    const sessions = getAllSessions();
    sessions[dayKey] = (sessions[dayKey] || 0) + rounded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event("datalens_stopwatch_updated"));

    // Async push to backend
    const token = getAuthToken();
    if (token) {
        fetch(`${API_BASE_URL}/log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                date: dayKey,
                seconds: rounded,
            }),
        }).catch(() => {
            // Background sync failure gracefully ignored
        });
    }

    return sessions[dayKey];
}

export function getSecondsForDay(dayKey = getTodayKey()) {
    return getAllSessions()[dayKey] || 0;
}

export function getLastNDays(n = 14) {
    const sessions = getAllSessions();
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        days.push({ date: key, label, seconds: sessions[key] || 0 });
    }
    return days;
}

export function clearDay(dayKey = getTodayKey()) {
    const sessions = getAllSessions();
    delete sessions[dayKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event("datalens_stopwatch_updated"));

    const token = getAuthToken();
    if (token) {
        fetch(`${API_BASE_URL}/${dayKey}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).catch(() => {});
    }
}

export function clearAllSessions() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("datalens_stopwatch_updated"));

    const token = getAuthToken();
    if (token) {
        fetch(API_BASE_URL, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).catch(() => {});
    }
}

export function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatShort(totalSeconds) {
    if (totalSeconds === 0) return "0m";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

// Initial background sync if user has token
setTimeout(() => {
    syncTimeSessionsWithBackend();
}, 500);
