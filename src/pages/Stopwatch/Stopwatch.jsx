import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BarChart2,
    TrendingUp,
    Play,
    Pause,
    Square,
    RotateCcw,
    Flame,
    CheckCircle2,
    AlertCircle,
    Award,
    Calendar,
    Clock,
    Zap,
    Sparkles,
} from "lucide-react";
import {
    formatTime,
    formatShort,
    addSecondsToDay,
    getSecondsForDay,
    getLastNDays,
    clearDay,
    clearAllSessions,
    getTodayKey,
    calculateStreaks,
    getAllSessions,
    getSavedSessionState,
    saveActiveSessionState,
} from "../../services/stopwatchService";
import { getAuthSession } from "../../services/authService";
import "./Stopwatch.css";

function Stopwatch() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const user = session?.user;
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

    // ── Timer state (restores saved session if refreshed) ───────────────────
    const initialSession = getSavedSessionState();

    const [running, setRunning] = useState(() => initialSession?.running || false);
    const [paused, setPaused] = useState(
        () => initialSession?.paused || (initialSession?.elapsed > 0 && !initialSession?.running)
    );
    const [elapsed, setElapsed] = useState(() => initialSession?.elapsed || 0); // seconds in current session
    const [todayTotal, setTodayTotal] = useState(() => getSecondsForDay());
    const intervalRef = useRef(null);
    const startTsRef = useRef(null);

    // ── Chart state ──────────────────────────────────────────────────────────
    const [chartRange, setChartRange] = useState(14);
    const [chartTick, setChartTick] = useState(0);
    const [chartType, setChartType] = useState("bar"); // "bar" | "line"
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
                saveActiveSessionState({ elapsed: secs, running: true, paused: false });
            }, 500);
        } else {
            clearInterval(intervalRef.current);
            saveActiveSessionState({ elapsed, running: false, paused });
        }
        return () => clearInterval(intervalRef.current);
    }, [running, paused, elapsed]);

    // ── Controls ─────────────────────────────────────────────────────────────
    const handleStart = () => {
        setRunning(true);
        setPaused(false);
        showToast(elapsed > 0 ? "Timer resumed" : "Timer started", "info");
    };

    const handlePause = () => {
        setRunning(false);
        setPaused(true);
        showToast(`Timer paused at ${formatTime(elapsed)}`, "info");
    };

    const handleStop = () => {
        setRunning(false);
        setPaused(false);
        if (elapsed > 0) {
            addSecondsToDay(elapsed);
            showToast(`Saved ${formatShort(elapsed)} to today's log`, "success");
            setElapsed(0);
            saveActiveSessionState(null);
        }
    };

    const handleReset = () => {
        setRunning(false);
        setPaused(false);
        setElapsed(0);
        saveActiveSessionState(null);
        showToast("Session reset to 00:00:00", "info");
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

    const peakDay = useMemo(() => {
        if (!days || days.length === 0) return null;
        return days.reduce((best, cur) => (cur.seconds > (best?.seconds || 0) ? cur : best), null);
    }, [days]);

    // ── Streak Calculations ───────────────────────────────────────────────────
    const streakInfo = useMemo(() => {
        const sessions = getAllSessions();
        if (days.length === 0 && todayTotal === 0) {
            return calculateStreaks(sessions);
        }
        return calculateStreaks(sessions);
    }, [days, todayTotal]);

    // Last 7 days visual streak indicators
    const streakWeekDays = useMemo(() => {
        const sessions = getAllSessions();
        if (days.length < 0 || todayTotal < 0) return [];
        const res = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = d.getDate();
            const isToday = i === 0;
            const hasLogged = (sessions[key] || 0) > 0;
            res.push({ key, dayName, dayNum, isToday, hasLogged, seconds: sessions[key] || 0 });
        }
        return res;
    }, [days, todayTotal]);

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
        const avgRatio = maxSeconds > 0 ? avgPerDay / maxSeconds : 0;
        const avgY = 190 - avgRatio * 170;

        return { path, area, points, avgY };
    }, [days, maxSeconds, avgPerDay]);

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

                {/* ── Top row: Timer + Ring + Stats ───────────────────────── */}
                <section className="sw-top-row">
                    {/* Big Timer Card */}
                    <div className="sw-timer-card">
                        <div className="sw-timer-header-badge">
                            <span className="sw-timer-label">Current Session</span>
                            {running ? (
                                <span className="sw-status-pill sw-status-running">
                                    <span className="sw-status-pulse" />
                                    Tracking
                                </span>
                            ) : paused ? (
                                <span className="sw-status-pill sw-status-paused">
                                    <Pause size={10} fill="currentColor" />
                                    Paused
                                </span>
                            ) : (
                                <span className="sw-status-pill sw-status-ready">
                                    Ready
                                </span>
                            )}
                        </div>

                        <div className={`sw-timer-display ${running ? "sw-timer-running" : paused ? "sw-timer-paused" : ""}`}>
                            {formatTime(elapsed)}
                        </div>

                        <div className="sw-timer-controls">
                            {!running && !paused && (
                                <button
                                    id="sw-start-btn"
                                    className="sw-btn sw-btn-start"
                                    onClick={handleStart}
                                >
                                    <Play size={16} fill="currentColor" />
                                    <span>Start Session</span>
                                </button>
                            )}

                            {running && (
                                <>
                                    <button
                                        id="sw-pause-btn"
                                        className="sw-btn sw-btn-pause"
                                        onClick={handlePause}
                                        title="Pause stopwatch (time is preserved)"
                                    >
                                        <Pause size={16} fill="currentColor" />
                                        <span>Pause</span>
                                    </button>
                                    <button
                                        id="sw-stop-btn"
                                        className="sw-btn sw-btn-stop"
                                        onClick={handleStop}
                                        title="Stop & save session to today's log"
                                    >
                                        <Square size={16} fill="currentColor" />
                                        <span>Stop & Save</span>
                                    </button>
                                </>
                            )}

                            {paused && (
                                <>
                                    <button
                                        id="sw-resume-btn"
                                        className="sw-btn sw-btn-resume"
                                        onClick={handleStart}
                                        title="Resume timer without starting from 0"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        <span>Resume</span>
                                    </button>
                                    <button
                                        id="sw-stop-btn"
                                        className="sw-btn sw-btn-stop"
                                        onClick={handleStop}
                                        title="Stop & save accumulated session"
                                    >
                                        <Square size={16} fill="currentColor" />
                                        <span>Stop & Save</span>
                                    </button>
                                </>
                            )}

                            <button
                                id="sw-reset-btn"
                                className="sw-btn sw-btn-reset"
                                onClick={handleReset}
                                disabled={running || elapsed === 0}
                                title="Reset session to 0"
                            >
                                <RotateCcw size={15} />
                                <span>Reset</span>
                            </button>
                        </div>

                        <p className="sw-timer-hint">
                            {running
                                ? "Timer is running. Click Pause to take a break without losing your time, or Stop & Save to log."
                                : paused
                                ? `Session paused at ${formatShort(elapsed)}. Click Resume to continue without starting from 0.`
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

                    {/* Quick Stats Column */}
                    <div className="sw-stats-col">
                        {/* Daily Streak Stat Card */}
                        <div className="sw-stat-card sw-stat-card-streak">
                            <div className="sw-stat-icon-wrap sw-stat-icon-streak">
                                <Flame size={18} className="sw-streak-icon-flame" />
                            </div>
                            <div className="sw-stat-text-wrap">
                                <div className="sw-stat-streak-val">
                                    <strong>{streakInfo.currentStreak} Day{streakInfo.currentStreak === 1 ? "" : "s"}</strong>
                                    {streakInfo.isActiveToday ? (
                                        <span className="sw-streak-tag sw-streak-tag-active">🔥 Active</span>
                                    ) : streakInfo.streakAtRisk ? (
                                        <span className="sw-streak-tag sw-streak-tag-risk">⚠️ At Risk</span>
                                    ) : null}
                                </div>
                                <small>
                                    {streakInfo.streakAtRisk
                                        ? "Log today to keep streak!"
                                        : streakInfo.isActiveToday
                                        ? `Best: ${streakInfo.longestStreak} days`
                                        : "Start streak today"}
                                </small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <Calendar size={18} color="#3b82f6" />
                            </div>
                            <div>
                                <strong>{activeDays}</strong>
                                <small>Active days in range</small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <Clock size={18} color="#3b82f6" />
                            </div>
                            <div>
                                <strong>{formatShort(totalTracked)}</strong>
                                <small>Total time recorded</small>
                            </div>
                        </div>

                        <div className="sw-stat-card">
                            <div className="sw-stat-icon-wrap">
                                <Award size={18} color="#3b82f6" />
                            </div>
                            <div>
                                <strong>{formatShort(avgPerDay)}</strong>
                                <small>Daily active average</small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Daily Streak & Consistency Tracker Banner ─────────────── */}
                <section className="sw-streak-banner">
                    <div className="sw-streak-header">
                        <div className="sw-streak-title-wrap">
                            <div className="sw-streak-flame-icon">
                                <Flame size={22} className="sw-flame-svg" />
                            </div>
                            <div>
                                <div className="sw-streak-title-row">
                                    <h2 className="sw-streak-heading">
                                        {streakInfo.currentStreak} Day{streakInfo.currentStreak === 1 ? "" : "s"} Tracking Streak
                                    </h2>
                                    {streakInfo.isActiveToday ? (
                                        <span className="sw-streak-pill sw-streak-pill-active">
                                            <CheckCircle2 size={13} /> Streak Active
                                        </span>
                                    ) : streakInfo.streakAtRisk ? (
                                        <span className="sw-streak-pill sw-streak-pill-warning">
                                            <AlertCircle size={13} /> At Risk: Log today to maintain!
                                        </span>
                                    ) : (
                                        <span className="sw-streak-pill sw-streak-pill-idle">
                                            Start your streak today
                                        </span>
                                    )}
                                </div>
                                <p className="sw-streak-desc">
                                    {streakInfo.streakAtRisk
                                        ? "You tracked time yesterday! Log a session today so your streak doesn't reset."
                                        : streakInfo.isActiveToday
                                        ? `Great consistency! You've logged ${formatShort(todayTotal)} today. Personal best: ${streakInfo.longestStreak} days.`
                                        : "Track time every day to build a habit and grow your productivity streak."}
                                </p>
                            </div>
                        </div>

                        <div className="sw-streak-metrics">
                            <div className="sw-streak-metric-box">
                                <span className="sw-streak-metric-val">{streakInfo.longestStreak}d</span>
                                <span className="sw-streak-metric-lbl">Best Streak</span>
                            </div>
                            <div className="sw-streak-metric-divider" />
                            <div className="sw-streak-metric-box">
                                <span className="sw-streak-metric-val">{streakInfo.totalActiveDays}d</span>
                                <span className="sw-streak-metric-lbl">Total Days Logged</span>
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Consistency Matrix */}
                    <div className="sw-streak-week-grid">
                        {streakWeekDays.map((d) => (
                            <div
                                key={d.key}
                                className={`sw-week-cell ${d.isToday ? "sw-week-cell-today" : ""} ${d.hasLogged ? "sw-week-cell-active" : ""}`}
                                title={`${d.key}: ${d.hasLogged ? formatShort(d.seconds) : "No session recorded"}`}
                            >
                                <span className="sw-week-day-title">{d.dayName}</span>
                                <div className="sw-week-icon-box">
                                    {d.hasLogged ? (
                                        <Flame size={16} className="sw-week-active-flame" />
                                    ) : (
                                        <span className="sw-week-cell-date">{d.dayNum}</span>
                                    )}
                                </div>
                                <span className="sw-week-day-time">
                                    {d.hasLogged ? formatShort(d.seconds) : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Bar / Line Chart ─────────────────────────────────────── */}
                <section className="sw-chart-card">
                    <div className="sw-chart-header">
                        <div className="sw-chart-title-group">
                            <div className="sw-chart-sub">
                                <Sparkles size={13} className="sw-chart-sparkle-icon" />
                                <span>Productivity Pulse</span>
                            </div>
                            <h2 className="sw-chart-title">Time Tracked per Day</h2>
                            <div className="sw-chart-meta-chips">
                                <div className="sw-meta-chip">
                                    <Clock size={12} className="sw-meta-icon" />
                                    <span>Total: <strong>{formatShort(totalTracked)}</strong></span>
                                </div>
                                <div className="sw-meta-chip">
                                    <Zap size={12} className="sw-meta-icon sw-meta-icon-zap" />
                                    <span>Avg: <strong>{formatShort(avgPerDay)}</strong>/day</span>
                                </div>
                                {peakDay && peakDay.seconds > 0 && (
                                    <div className="sw-meta-chip sw-meta-chip-peak">
                                        <Flame size={12} className="sw-meta-icon sw-meta-icon-flame" />
                                        <span>Peak: <strong>{formatShort(peakDay.seconds)}</strong> ({peakDay.label})</span>
                                    </div>
                                )}
                            </div>
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
                                    {days.map((day, i) => {
                                        const heightPct =
                                            maxSeconds > 0
                                                ? (day.seconds / maxSeconds) * 100
                                                : 0;
                                        const isToday = day.date === getTodayKey();
                                        const isHovered = hoveredIndex === i;
                                        const dayObj = new Date(day.date + "T00:00:00");
                                        const dayName = dayObj.toLocaleDateString("en-US", { weekday: "short" });
                                        const pctOfGoal = Math.min(Math.round((day.seconds / (8 * 3600)) * 100), 100);

                                        return (
                                            <div
                                                key={day.date}
                                                className={`sw-bar-col ${isHovered ? "sw-col-hovered" : ""}`}
                                                onMouseEnter={() => setHoveredIndex(i)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            >
                                                {/* Modern Rich Floating Tooltip */}
                                                <div className={`sw-bar-tooltip ${isHovered ? "visible" : ""}`}>
                                                    <div className="sw-tt-head">
                                                        <span className="sw-tt-date">{dayName}, {day.label}</span>
                                                        {isToday && <span className="sw-tt-badge">Today</span>}
                                                    </div>
                                                    <div className="sw-tt-val">
                                                        <Clock size={12} />
                                                        <strong>{formatShort(day.seconds)}</strong>
                                                    </div>
                                                    <div className="sw-tt-footer">
                                                        {day.seconds > 0 ? (
                                                            <span>{pctOfGoal}% of 8h goal</span>
                                                        ) : (
                                                            <span className="sw-tt-dim">No time logged</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Futuristic Slot Track */}
                                                <div className="sw-bar-track">
                                                    <div
                                                        className={`sw-bar ${isToday ? "sw-bar-today" : ""} ${day.seconds === 0 ? "sw-bar-empty" : "sw-bar-active"}`}
                                                        style={{ height: `${Math.max(heightPct, day.seconds > 0 ? 3 : 0)}%` }}
                                                    >
                                                        {day.seconds > 0 && <span className="sw-bar-glow-cap" />}
                                                    </div>
                                                </div>
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
                                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                                                <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.18" />
                                                <stop offset="85%" stopColor="#1d4ed8" stopOpacity="0.04" />
                                                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
                                            </linearGradient>

                                            <linearGradient id="swStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#38bdf8" />
                                                <stop offset="50%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#818cf8" />
                                            </linearGradient>

                                            <filter id="swGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.6" />
                                            </filter>
                                        </defs>

                                        {/* Filled area */}
                                        <path d={lineChartData.area} fill="url(#swLineGradient)" />

                                        {/* Average Benchmark Guide */}
                                        {lineChartData.avgY > 0 && lineChartData.avgY < 190 && (
                                            <g className="sw-line-avg-guide">
                                                <line
                                                    x1="0"
                                                    y1={lineChartData.avgY}
                                                    x2="1000"
                                                    y2={lineChartData.avgY}
                                                    stroke="rgba(56, 189, 248, 0.35)"
                                                    strokeWidth="1.2"
                                                    strokeDasharray="4 4"
                                                />
                                            </g>
                                        )}

                                        {/* Smooth Glowing Line */}
                                        <path
                                            d={lineChartData.path}
                                            fill="none"
                                            stroke="url(#swStrokeGradient)"
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#swGlow)"
                                        />

                                        {/* Vertical laser guideline on hover */}
                                        {hoveredIndex !== null && lineChartData.points[hoveredIndex] && (
                                            <line
                                                x1={lineChartData.points[hoveredIndex].x}
                                                y1={190}
                                                x2={lineChartData.points[hoveredIndex].x}
                                                y2={lineChartData.points[hoveredIndex].y}
                                                stroke="#38bdf8"
                                                strokeWidth="1.5"
                                                strokeDasharray="3 3"
                                                className="sw-laser-crosshair"
                                            />
                                        )}

                                        {/* Points with pulse rings */}
                                        {lineChartData.points.map((pt, i) => {
                                            const isHovered = hoveredIndex === i;
                                            return (
                                                <g key={pt.day.date} className="sw-node-group">
                                                    {(pt.isToday || isHovered) && pt.day.seconds > 0 && (
                                                        <circle
                                                            cx={pt.x}
                                                            cy={pt.y}
                                                            r={isHovered ? 12 : 9}
                                                            className="sw-line-dot-pulse"
                                                        />
                                                    )}
                                                    <circle
                                                        cx={pt.x}
                                                        cy={pt.y}
                                                        r={isHovered ? 6.5 : pt.isToday ? 5.5 : pt.day.seconds > 0 ? 4.5 : 2.5}
                                                        className={`sw-line-dot ${pt.isToday ? "sw-line-dot-today" : ""} ${pt.day.seconds === 0 ? "sw-line-dot-empty" : "sw-line-dot-active"} ${isHovered ? "sw-line-dot-hovered" : ""}`}
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* Interactive Hover columns with rich tooltip */}
                                    <div className="sw-line-hover-grid">
                                        {lineChartData.points.map((pt, i) => {
                                            const isToday = pt.day.date === getTodayKey();
                                            const isHovered = hoveredIndex === i;
                                            const dayObj = new Date(pt.day.date + "T00:00:00");
                                            const dayName = dayObj.toLocaleDateString("en-US", { weekday: "short" });
                                            const pctOfGoal = Math.min(Math.round((pt.day.seconds / (8 * 3600)) * 100), 100);

                                            return (
                                                <div
                                                    key={pt.day.date}
                                                    className="sw-line-hit-col"
                                                    onMouseEnter={() => setHoveredIndex(i)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                >
                                                    <div className={`sw-bar-tooltip ${isHovered ? "visible" : ""}`}>
                                                        <div className="sw-tt-head">
                                                            <span className="sw-tt-date">{dayName}, {pt.day.label}</span>
                                                            {isToday && <span className="sw-tt-badge">Today</span>}
                                                        </div>
                                                        <div className="sw-tt-val">
                                                            <Clock size={12} />
                                                            <strong>{formatShort(pt.day.seconds)}</strong>
                                                        </div>
                                                        <div className="sw-tt-footer">
                                                            {pt.day.seconds > 0 ? (
                                                                <span>{pctOfGoal}% of 8h goal</span>
                                                            ) : (
                                                                <span className="sw-tt-dim">No time logged</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* X labels */}
                    <div className="sw-x-labels">
                        {days.map((day, i) => {
                            const isToday = day.date === getTodayKey();
                            const isHovered = hoveredIndex === i;
                            return (
                                <span
                                    key={day.date}
                                    className={`sw-x-label-item ${isToday ? "sw-x-today" : ""} ${isHovered ? "sw-x-hovered" : ""}`}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <span className="sw-x-label-text">{day.label}</span>
                                    {isToday && <span className="sw-x-today-dot" />}
                                </span>
                            );
                        })}
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
