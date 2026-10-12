import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    formatTime,
    formatShort,
    addSecondsToDay,
    getSecondsForDay,
    getLastNDays,
    clearDay,
    clearAllSessions,
    getTodayKey,
} from "../../services/stopwatchService";
import "./Stopwatch.css";

function Stopwatch() {
    const navigate = useNavigate();

    // ── Timer state ──────────────────────────────────────────────────────────
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);          // seconds in current session
    const [todayTotal, setTodayTotal] = useState(() => getSecondsForDay());
    const intervalRef = useRef(null);
    const startTsRef = useRef(null);

    // ── Chart state ──────────────────────────────────────────────────────────
    const [days, setDays] = useState(() => getLastNDays(14));
    const [chartRange, setChartRange] = useState(14);

    // ── Toast ────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);

    // ── Confirm dialog ───────────────────────────────────────────────────────
    const [confirm, setConfirm] = useState(null); // { message, onConfirm }

    // Reload chart whenever storage changes
    const refreshChart = useCallback(() => {
        setDays(getLastNDays(chartRange));
        setTodayTotal(getSecondsForDay());
    }, [chartRange]);

    useEffect(() => {
        window.addEventListener("datalens_stopwatch_updated", refreshChart);
        return () =>
            window.removeEventListener("datalens_stopwatch_updated", refreshChart);
    }, [refreshChart]);

    useEffect(() => {
        setDays(getLastNDays(chartRange));
    }, [chartRange]);

    // ── Timer tick ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (running) {
            startTsRef.current = Date.now() - elapsed * 1000;
            intervalRef.current = setInterval(() => {
                const secs = Math.floor((Date.now() - startTsRef.current) / 1000);
                setElapsed(secs);
            }, 500);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    // ── Controls ─────────────────────────────────────────────────────────────
    const handleStart = () => {
        setRunning(true);
        showToast("⏱ Timer started", "info");
    };

    const handleStop = () => {
        setRunning(false);
        if (elapsed > 0) {
            addSecondsToDay(elapsed);
            showToast(`✅ Saved ${formatShort(elapsed)} to today's log`, "success");
            setElapsed(0);
        }
    };

    const handleReset = () => {
        setRunning(false);
        setElapsed(0);
    };

    const handleClearToday = () => {
        setConfirm({
            message: `Clear all tracked time for today (${formatShort(todayTotal)})?`,
            onConfirm: () => {
                clearDay(getTodayKey());
                showToast("🗑 Today's log cleared", "info");
                setConfirm(null);
            },
        });
    };

    const handleClearAll = () => {
        setConfirm({
            message: "Clear ALL daily records? This cannot be undone.",
            onConfirm: () => {
                clearAllSessions();
                showToast("🗑 All records cleared", "info");
                setConfirm(null);
            },
        });
    };

    // ── Toast helper ─────────────────────────────────────────────────────────
    const showToast = (msg, type = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Chart calculations ────────────────────────────────────────────────────
    const maxSeconds = Math.max(...days.map((d) => d.seconds), 1);
    const totalTracked = days.reduce((a, d) => a + d.seconds, 0);
    const activeDays = days.filter((d) => d.seconds > 0).length;
    const avgPerDay = activeDays > 0 ? Math.round(totalTracked / activeDays) : 0;

    // ── Today's ring progress (max = 8 hours) ────────────────────────────────
    const TARGET = 8 * 3600;
    const ringPct = Math.min((todayTotal / TARGET) * 100, 100);
    const CIRCUMFERENCE = 2 * Math.PI * 54;
    const dashOffset = CIRCUMFERENCE - (ringPct / 100) * CIRCUMFERENCE;

    return (
        <div className="sw-page">
            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="sw-sidebar">
                <div className="sw-brand">
                    <div className="sw-logo">D</div>
                    <span>DataLens</span>
                </div>

                <nav className="sw-nav">
                    <Link to="/dashboard" className="sw-nav-item">
                        <span>⌂</span> Dashboard
                    </Link>
                    <Link to="/dataset/create" className="sw-nav-item">
                        <span>＋</span> Datasets
                    </Link>
                    <Link to="/compare" className="sw-nav-item">
                        <span>⇄</span> Compare
                    </Link>
                    <Link to="/stopwatch" className="sw-nav-item active">
                        <span>⏱</span> Time Tracker
                    </Link>
                    <Link to="/profile" className="sw-nav-item">
                        <span>◎</span> Profile
                    </Link>
                </nav>

                <div className="sw-sidebar-bottom">
                    <button className="sw-sidebar-btn" onClick={() => navigate("/profile")}>
                        ⚙ Settings
                    </button>
                </div>
            </aside>

            {/* ── Main ─────────────────────────────────────────────────────── */}
            <main className="sw-main">
                {/* Header */}
                <header className="sw-header">
                    <div>
                        <span className="sw-header-sub">Productivity</span>
                        <h1>Time Tracker</h1>
                    </div>
                    <div className="sw-header-actions">
                        <select
                            className="sw-range-select"
                            value={chartRange}
                            onChange={(e) => setChartRange(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                        </select>
                        <Link to="/profile" className="sw-profile-link">
                            <div className="sw-avatar">T</div>
                        </Link>
                    </div>
                </header>

                {/* ── Top row: Timer + Ring ─────────────────────────────────── */}
                <section className="sw-top-row">
                    {/* Big Timer Card */}
                    <div className="sw-timer-card">
                        <div className="sw-timer-label">Current Session</div>
                        <div className={`sw-timer-display ${running ? "sw-timer-running" : ""}`}>
                            {formatTime(elapsed)}
                        </div>

                        <div className="sw-timer-controls">
                            {!running ? (
                                <button
                                    id="sw-start-btn"
                                    className="sw-btn sw-btn-start"
                                    onClick={handleStart}
                                >
                                    ▶ Start
                                </button>
                            ) : (
                                <button
                                    id="sw-stop-btn"
                                    className="sw-btn sw-btn-stop"
                                    onClick={handleStop}
                                >
                                    ⏹ Stop & Save
                                </button>
                            )}
                            <button
                                id="sw-reset-btn"
                                className="sw-btn sw-btn-reset"
                                onClick={handleReset}
                                disabled={running}
                            >
                                ↺ Reset
                            </button>
                        </div>

                        <p className="sw-timer-hint">
                            {running
                                ? "Timer is running — click Stop & Save to log this session"
                                : "Press Start to begin a new session"}
                        </p>
                    </div>

                    {/* Today's Ring + Stats */}
                    <div className="sw-today-card">
                        <div className="sw-today-label">Today's Progress</div>
                        <div className="sw-ring-wrapper">
                            <svg viewBox="0 0 120 120" className="sw-ring-svg">
                                <circle
                                    className="sw-ring-bg"
                                    cx="60" cy="60" r="54"
                                    strokeWidth="10"
                                    fill="none"
                                />
                                <circle
                                    className="sw-ring-fill"
                                    cx="60" cy="60" r="54"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray={CIRCUMFERENCE}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className="sw-ring-center">
                                <span className="sw-ring-time">{formatShort(todayTotal)}</span>
                                <span className="sw-ring-pct">{Math.round(ringPct)}% of 8h goal</span>
                            </div>
                        </div>

                        <div className="sw-today-actions">
                            <button
                                id="sw-clear-today-btn"
                                className="sw-btn-ghost sw-btn-danger"
                                onClick={handleClearToday}
                            >
                                🗑 Clear Today
                            </button>
                            <button
                                id="sw-clear-all-btn"
                                className="sw-btn-ghost"
                                onClick={handleClearAll}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="sw-stats-col">
                        <div className="sw-stat-card">
                            <span className="sw-stat-icon">📅</span>
                            <div>
                                <strong>{activeDays}</strong>
                                <small>Active days in range</small>
                            </div>
                        </div>
                        <div className="sw-stat-card">
                            <span className="sw-stat-icon">⏳</span>
                            <div>
                                <strong>{formatShort(totalTracked)}</strong>
                                <small>Total tracked</small>
                            </div>
                        </div>
                        <div className="sw-stat-card">
                            <span className="sw-stat-icon">📊</span>
                            <div>
                                <strong>{formatShort(avgPerDay)}</strong>
                                <small>Avg per active day</small>
                            </div>
                        </div>
                        <div className="sw-stat-card">
                            <span className="sw-stat-icon">🏆</span>
                            <div>
                                <strong>
                                    {formatShort(Math.max(...days.map((d) => d.seconds)))}
                                </strong>
                                <small>Best day in range</small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Bar Chart ─────────────────────────────────────────────── */}
                <section className="sw-chart-card">
                    <div className="sw-chart-header">
                        <div>
                            <span className="sw-chart-sub">Daily Progress</span>
                            <h2 className="sw-chart-title">Time Tracked per Day</h2>
                        </div>
                        <div className="sw-chart-legend">
                            <span className="sw-legend-dot"></span> Hours tracked
                        </div>
                    </div>

                    <div className="sw-bar-chart">
                        {/* Y-axis labels */}
                        <div className="sw-y-axis">
                            {[100, 75, 50, 25, 0].map((p) => {
                                const secs = Math.round((p / 100) * maxSeconds);
                                return (
                                    <span key={p}>{p === 0 ? "0" : formatShort(secs)}</span>
                                );
                            })}
                        </div>

                        {/* Bars area */}
                        <div className="sw-bars-area">
                            <div className="sw-grid-lines">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="sw-grid-line" />
                                ))}
                            </div>

                            <div className="sw-bars">
                                {days.map((day) => {
                                    const heightPct =
                                        maxSeconds > 0
                                            ? (day.seconds / maxSeconds) * 100
                                            : 0;
                                    const isToday = day.date === getTodayKey();
                                    return (
                                        <div
                                            key={day.date}
                                            className="sw-bar-col"
                                            title={`${day.label}: ${formatShort(day.seconds)}`}
                                        >
                                            <div className="sw-bar-tooltip">
                                                {formatShort(day.seconds)}
                                            </div>
                                            <div
                                                className={`sw-bar ${isToday ? "sw-bar-today" : ""} ${day.seconds === 0 ? "sw-bar-empty" : ""}`}
                                                style={{ height: `${Math.max(heightPct, day.seconds > 0 ? 2 : 0)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* X labels */}
                    <div className="sw-x-labels">
                        {days.map((day) => (
                            <span
                                key={day.date}
                                className={day.date === getTodayKey() ? "sw-x-today" : ""}
                            >
                                {day.label}
                            </span>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── Toast ────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`sw-toast sw-toast-${toast.type}`}>
                    {toast.msg}
                </div>
            )}

            {/* ── Confirm Dialog ───────────────────────────────────────────── */}
            {confirm && (
                <div className="sw-confirm-overlay">
                    <div className="sw-confirm-box">
                        <p>{confirm.message}</p>
                        <div className="sw-confirm-actions">
                            <button
                                className="sw-btn sw-btn-stop"
                                onClick={confirm.onConfirm}
                            >
                                Yes, Clear
                            </button>
                            <button
                                className="sw-btn-ghost"
                                onClick={() => setConfirm(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Stopwatch;
