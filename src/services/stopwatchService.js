// stopwatchService.js
// Persists daily time-tracking sessions in localStorage.

const STORAGE_KEY = "datalens_stopwatch_sessions";

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

export function addSecondsToDay(seconds, dayKey = getTodayKey()) {
    const sessions = getAllSessions();
    sessions[dayKey] = (sessions[dayKey] || 0) + Math.round(seconds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event("datalens_stopwatch_updated"));
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
}

export function clearAllSessions() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("datalens_stopwatch_updated"));
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
