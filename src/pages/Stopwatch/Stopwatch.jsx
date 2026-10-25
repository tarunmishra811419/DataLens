import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, TrendingUp } from "lucide-react";
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
import { getAuthSession } from "../../services/authService";
import "./Stopwatch.css";

function Stopwatch() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const user = session?.user;
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

    // ── Timer state ──────────────────────────────────────────────────────────
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);          // seconds in current session
    const [todayTotal, setTodayTotal] = useState(() => getSecondsForDay());
    const intervalRef = useRef(null);
    const startTsRef = useRef(null);

    // ── Chart state ──────────────────────────────────────────────────────────
    const [chartRange, setChartRange] = useState(14);
    const [chartTick, setChartTick] = useState(0);
    const [chartType, setChartType] = useState("bar"); // "bar" | "line"

    const days = useMemo(() => {
        if (chartTick < 0) return [];
        return getLastNDays(chartRange);
    }, [chartRange, chartTick]);

    // ── Toast ────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);

    // ── Confirm dialog ───────────────────────────────────────────────────────
    const [confirm, setConfirm] = useState(null); // { message, onConfirm }

    // Reload chart whenever storage changes
    const refreshChart = useCallback(() => {
        setTodayTotal(getSecondsForDay());
        setChartTick((t) => t + 1);
    }, []);

    useEffect(() => {
        window.addEventListener("datalens_stopwatch_updated", refreshChart);
        return () =>
            window.removeEventListener("datalens_stopwatch_updated", refreshChart);
    }, [refreshChart]);

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
    }, [running, elapsed]);

    // ── Controls ─────────────────────────────────────────────────────────────
    const handleStart = () => {
        setRunning(true);
        showToast("Timer started", "info");
    };

    const handleStop = () => {
        setRunning(false);
        if (elapsed > 0) {
            addSecondsToDay(elapsed);
            showToast(`Saved ${formatShort(elapsed)} to today's log`, "success");
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
                showToast("Today's log cleared", "info");
                setConfirm(null);
            },
        });
    };

    const handleClearAll = () => {
        setConfirm({
            message: "Clear all daily records? This action cannot be undone.",
            onConfirm: () => {
                clearAllSessions();
                showToast("All records cleared", "info");
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

    // ── Line Chart Coordinates ────────────────────────────────────────────────
    const lineChartData = useMemo(() => {
        if (!days || days.length === 0) return { path: "", area: "", points: [] };
        const N = days.length;
        const colWidth = 1000 / N;
        const points = days.map((day, i) => {
            const x = (i + 0.5) * colWidth;
            const ratio = maxSeconds > 0 ? day.seconds / maxSeconds : 0;
            // 200px coordinate system: bottom is 190, top is 15
            const y = 190 - ratio * 170;
            return {
                x,
                y,
                day,
                index: i,
                isToday: day.date === getTodayKey(),
            };
        });

        if (points.length === 1) {
            const p = points[0];
            return {
                path: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
                area: `M ${p.x - 20} 200 L ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} 200 Z`,
                points,
            };
        }

        // Cubic spline path through points
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }

        const first = points[0];
        const last = points[points.length - 1];
        const area = `${path} L ${last.x} 200 L ${first.x} 200 Z`;

        return { path, area, points };
    }, [days, maxSeconds]);

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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link to="/dataset/create" className="sw-nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        Datasets
                    </Link>
                    <Link to="/compare" className="sw-nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 3 21 3 21 8" />
                            <line x1="4" y1="20" x2="21" y2="3" />
                            <polyline points="21 16 21 21 16 21" />
                            <line x1="15" y1="15" x2="21" y2="21" />
                            <line x1="4" y1="4" x2="9" y2="9" />
                        </svg>
                        Compare
                    </Link>
                    <Link to="/stopwatch" className="sw-nav-item active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Time Tracker
                    </Link>
                    <Link to="/profile" className="sw-nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                    </Link>
                </nav>

                <div className="sw-sidebar-bottom">
                    <button className="sw-sidebar-btn" onClick={() => navigate(user ? "/profile" : "/login")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                    </button>
                </div>
            </aside>

            {/* ── Main ─────────────────────────────────────────────────────── */}
            <main className="sw-main">
                {/* Header */}
                <header className="sw-header">
                    <div>
                        <span className="sw-header-sub">Productivity Log</span>
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
                        <Link to={user ? "/profile" : "/login"} className="sw-profile-link">
                            <div className="sw-avatar">{userInitial}</div>
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
                                    Start Session
                                </button>
                            ) : (
                                <button
                                    id="sw-stop-btn"
                                    className="sw-btn sw-btn-stop"
                                    onClick={handleStop}
                                >
                                    Stop & Save
                                </button>
                            )}
                            <button
                                id="sw-reset-btn"
                                className="sw-btn sw-btn-reset"
                                onClick={handleReset}
                                disabled={running}
                            >
                                Reset
                            </button>
                        </div>

                        <p className="sw-timer-hint">
                            {running
                                ? "Timer is running: click Stop & Save to log this session"
                                : "Click Start Session to begin tracking work"}
                        </p>
                    </div>

                    {/* Today's Ring + Stats */}
                    <div className="sw-today-card">
                        <div className="sw-today-label">Today's Total</div>
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
                                Clear Today
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
                            <div className="sw-stat-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div>
                                <strong>{activeDays}</strong>
                                <small>Active days in range</small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <strong>{formatShort(totalTracked)}</strong>
                                <small>Total time recorded</small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <div>
                                <strong>{formatShort(avgPerDay)}</strong>
                                <small>Daily active average</small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>
                                    {formatShort(Math.max(...days.map((d) => d.seconds)))}
                                </strong>
                                <small>Peak session day</small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Bar / Line Chart ─────────────────────────────────────── */}
                <section className="sw-chart-card">
                    <div className="sw-chart-header">
                        <div>
                            <span className="sw-chart-sub">Daily Distribution</span>
                            <h2 className="sw-chart-title">Time Tracked per Day</h2>
                        </div>
                        <div className="sw-chart-header-actions">
                            <div className="sw-chart-type-toggle">
                                <button
                                    type="button"
                                    className={`sw-toggle-btn ${chartType === "bar" ? "active" : ""}`}
                                    onClick={() => setChartType("bar")}
                                    title="Bar Graph View"
                                    aria-label="Bar Graph View"
                                >
                                    <BarChart2 size={14} />
                                    <span>Bar</span>
                                </button>
                                <button
                                    type="button"
                                    className={`sw-toggle-btn ${chartType === "line" ? "active" : ""}`}
                                    onClick={() => setChartType("line")}
                                    title="Line Graph View"
                                    aria-label="Line Graph View"
                                >
                                    <TrendingUp size={14} />
                                    <span>Line</span>
                                </button>
                            </div>
                            <div className="sw-chart-legend">
                                <span className={`sw-legend-dot ${chartType === "line" ? "sw-legend-line" : ""}`}></span>
                                <span>Hours tracked</span>
                            </div>
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

                            {chartType === "bar" ? (
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
                            ) : (
                                <div className="sw-line-chart-container">
                                    <svg
                                        viewBox="0 0 1000 200"
                                        preserveAspectRatio="none"
                                        className="sw-line-svg"
                                    >
                                        <defs>
                                            <linearGradient id="swLineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.38" />
                                                <stop offset="70%" stopColor="#2563eb" stopOpacity="0.08" />
                                                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Filled area */}
                                        <path d={lineChartData.area} fill="url(#swLineGradient)" />

                                        {/* Smooth Line */}
                                        <path
                                            d={lineChartData.path}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Points */}
                                        {lineChartData.points.map((pt) => (
                                            <circle
                                                key={pt.day.date}
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={pt.isToday ? 5.5 : pt.day.seconds > 0 ? 4 : 2.5}
                                                className={`sw-line-dot ${pt.isToday ? "sw-line-dot-today" : ""} ${pt.day.seconds === 0 ? "sw-line-dot-empty" : ""}`}
                                            />
                                        ))}
                                    </svg>

                                    {/* Hover columns with tooltip */}
                                    <div className="sw-line-hover-grid">
                                        {lineChartData.points.map((pt) => (
                                            <div
                                                key={pt.day.date}
                                                className="sw-line-hit-col"
                                                title={`${pt.day.label}: ${formatShort(pt.day.seconds)}`}
                                            >
                                                <div className="sw-bar-tooltip">
                                                    {formatShort(pt.day.seconds)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                Confirm Clear
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
