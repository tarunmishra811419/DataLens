// stopwatchService.js
// Persists daily time-tracking sessions with per-user local storage & cloud database sync.

import { getAuthSession } from "./authService.js";

const API_BASE_URL =
    (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/time-sessions";

/**
 * Returns a unique storage key for the active user session.
 * Ensures User A's tracked time is isolated from User B.
 */
export function getStopwatchStorageKey() {
    try {
        const session = getAuthSession();
        const uid =
            session?.user?._id ||
            session?.user?.id ||
            (session?.user?.email ? encodeURIComponent(session.user.email) : "guest");
        return `datalens_stopwatch_sessions_${uid}`;
    } catch {
        return "datalens_stopwatch_sessions_guest";
    }
}

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
        const key = getStopwatchStorageKey();
        const raw = localStorage.getItem(key);
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
            localStorage.setItem(getStopwatchStorageKey(), JSON.stringify(merged));
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
    localStorage.setItem(getStopwatchStorageKey(), JSON.stringify(sessions));
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
    localStorage.setItem(getStopwatchStorageKey(), JSON.stringify(sessions));
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
    localStorage.removeItem(getStopwatchStorageKey());
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

/**
 * Calculates current and longest consecutive daily tracking streaks.
 * If user logged time today, current streak includes today.
 * If user logged yesterday but not yet today, streak is held at risk so they can save it today.
 */
export function calculateStreaks(sessions = getAllSessions()) {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    const todaySeconds = sessions[todayKey] || 0;
    const yesterdaySeconds = sessions[yesterdayKey] || 0;

    const isActiveToday = todaySeconds > 0;
    let currentStreak;
    let streakAtRisk = false;

    let checkDate = new Date();
    if (isActiveToday) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
    } else if (yesterdaySeconds > 0) {
        currentStreak = 1;
        streakAtRisk = true;
        checkDate.setDate(checkDate.getDate() - 2);
    } else {
        currentStreak = 0;
    }

    if (currentStreak > 0) {
        while (true) {
            const key = checkDate.toISOString().split("T")[0];
            if ((sessions[key] || 0) > 0) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // Longest streak across history
    const activeDates = Object.keys(sessions)
        .filter((k) => (sessions[k] || 0) > 0)
        .sort();

    let longestStreak = currentStreak;
    let tempStreak = 0;
    let prevTimestamp = null;

    for (const dateStr of activeDates) {
        const [y, m, d] = dateStr.split("-").map(Number);
        const curTimestamp = Date.UTC(y, m - 1, d);

        if (prevTimestamp === null) {
            tempStreak = 1;
        } else {
            const diffDays = Math.round((curTimestamp - prevTimestamp) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        }
        prevTimestamp = curTimestamp;
        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
        }
    }

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        isActiveToday,
        streakAtRisk,
        totalActiveDays: activeDates.length,
    };
}

export function getSavedSessionState() {
    try {
        const key = `${getStopwatchStorageKey()}_active_session`;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.dayKey !== getTodayKey()) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function saveActiveSessionState(state) {
    try {
        const key = `${getStopwatchStorageKey()}_active_session`;
        if (!state || (state.elapsed === 0 && !state.running)) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(
                key,
                JSON.stringify({ ...state, dayKey: getTodayKey(), savedAt: Date.now() })
            );
        }
    } catch {
        // Ignored
    }
}

// Initial background sync if user has token
setTimeout(() => {
    syncTimeSessionsWithBackend();
}, 500);

if (typeof window !== "undefined") {
    window.addEventListener("datalens_auth_changed", () => {
        syncTimeSessionsWithBackend();
    });
}
