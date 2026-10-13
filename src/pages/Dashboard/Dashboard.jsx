import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthSession, clearAuthSession } from "../../services/authService";
import { getSavedDatasets, getDatasetStats } from "../../services/datasetService";
import { getSecondsForDay, formatShort } from "../../services/stopwatchService";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const user = session?.user;
    const userName = user?.name || "Guest Analyst";
    const userRole = user?.role || (user ? "Data Analyst" : "Guest Mode");

    const [stats, setStats] = useState(() => getDatasetStats());
    const [recentDatasets, setRecentDatasets] = useState(() => getSavedDatasets().slice(0, 4));
    const [todayTime, setTodayTime] = useState(() => getSecondsForDay());

    useEffect(() => {
        const updateData = () => {
            setStats(getDatasetStats());
            setRecentDatasets(getSavedDatasets().slice(0, 4));
            setTodayTime(getSecondsForDay());
        };
        window.addEventListener("datalens_datasets_updated", updateData);
        window.addEventListener("datalens_stopwatch_updated", updateData);
        return () => {
            window.removeEventListener("datalens_datasets_updated", updateData);
            window.removeEventListener("datalens_stopwatch_updated", updateData);
        };
    }, []);

    const handleLogout = () => {
        clearAuthSession();
        navigate("/login");
    };

    const handleOpenSampleDataset = (name, category) => {
        navigate("/dataset/manual", {
            state: {
                datasetName: name,
                category: category || "Business",
            },
        });
    };

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">D</div>
                    <span>DataLens</span>
                </div>

                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link to="/dataset/create" className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        Datasets
                    </Link>

                    <Link to="/compare" className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 3 21 3 21 8" />
                            <line x1="4" y1="20" x2="21" y2="3" />
                            <polyline points="21 16 21 21 16 21" />
                            <line x1="15" y1="15" x2="21" y2="21" />
                            <line x1="4" y1="4" x2="9" y2="9" />
                        </svg>
                        Compare
                    </Link>

                    <Link to="/stopwatch" className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Time Tracker
                    </Link>

                    <Link to="/profile" className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                    </Link>
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="sidebar-settings"
                        onClick={() => navigate(user ? "/profile" : "/login")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                    </button>

                    {user ? (
                        <button
                            className="sidebar-logout"
                            onClick={handleLogout}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log Out
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="sidebar-logout"
                            style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Guest Notice Banner */}
                {!user && (
                    <div
                        style={{
                            background: "rgba(37, 99, 235, 0.08)",
                            border: "1px solid rgba(37, 99, 235, 0.2)",
                            borderRadius: "8px",
                            padding: "12px 20px",
                            marginBottom: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "12px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span style={{ fontSize: "14px", color: "#cbd5e1" }}>
                                Operating in <strong>Guest Mode</strong>. Datasets are stored in local browser cache.
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                                to="/register"
                                style={{
                                    background: "#2563eb",
                                    color: "#fff",
                                    padding: "6px 14px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                Create Free Account
                            </Link>
                            <Link
                                to="/login"
                                style={{
                                    background: "rgba(255, 255, 255, 0.08)",
                                    color: "#cbd5e1",
                                    padding: "6px 14px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}

                {/* Top Bar */}
                <header className="dashboard-header">
                    <div>
                        <span className="dashboard-greeting">
                            Workspace
                        </span>
                        <h1>Dashboard</h1>
                    </div>

                    <Link to={user ? "/profile" : "/login"} className="dashboard-user" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="user-avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{userName}</strong>
                            <span>{userRole}</span>
                        </div>
                    </Link>
                </header>

                {/* Welcome Banner */}
                <section className="dashboard-welcome">
                    <div>
                        <span>Analytics Workspace</span>
                        <h2>
                            Structured dataset management and visualization
                        </h2>
                        <p>
                            Import spreadsheets, inspect distribution metrics, and render production charts in real time.
                        </p>
                    </div>

                    <Link
                        to="/dataset/create"
                        className="dashboard-primary-button"
                    >
                        + Add Dataset
                    </Link>
                </section>

                {/* Stats */}
                <section className="dashboard-stats">
                    <div className="stat-card">
                        <span>Total Datasets</span>
                        <strong>{stats.totalDatasets}</strong>
                        <small>Active in workspace</small>
                    </div>

                    <div className="stat-card">
                        <span>Total Rows Processed</span>
                        <strong>{stats.totalRows.toLocaleString()}</strong>
                        <small>Calculated records</small>
                    </div>

                    <div className="stat-card">
                        <span>Data Cells Cached</span>
                        <strong>{stats.totalCells.toLocaleString()}</strong>
                        <small>Grid cells indexed</small>
                    </div>

                    <div className="stat-card">
                        <span>Session Time Today</span>
                        <strong>{formatShort(todayTime)}</strong>
                        <small>Logged in time tracker</small>
                    </div>
                </section>

                {/* Main Dashboard Grid */}
                <section className="dashboard-grid">
                    {/* Performance Chart */}
                    <div className="dashboard-panel chart-panel">
                        <div className="panel-header">
                            <div>
                                <span>Volume</span>
                                <h3>Data Activity Overview</h3>
                            </div>

                            <select defaultValue="6">
                                <option value="6">Last 6 months</option>
                                <option value="3">Last 3 months</option>
                                <option value="12">Last 12 months</option>
                            </select>
                        </div>

                        <div className="dashboard-chart">
                            <div className="chart-y-axis">
                                <span>100</span>
                                <span>75</span>
                                <span>50</span>
                                <span>25</span>
                                <span>0</span>
                            </div>

                            <div className="chart-area">
                                <div className="chart-lines">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className="dashboard-bars">
                                    <div style={{ height: "35%" }} />
                                    <div style={{ height: "48%" }} />
                                    <div style={{ height: "42%" }} />
                                    <div style={{ height: "65%" }} />
                                    <div style={{ height: "72%" }} />
                                    <div style={{ height: "88%" }} />
                                </div>
                            </div>
                        </div>

                        <div className="chart-months">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                        </div>
                    </div>

                    {/* Recent Datasets */}
                    <div className="dashboard-panel recent-panel">
                        <div className="panel-header">
                            <div>
                                <span>Repository</span>
                                <h3>Recent Datasets</h3>
                            </div>

                            <Link to="/dataset/create">
                                View all
                            </Link>
                        </div>

                        <div className="dataset-list">
                            {recentDatasets.length > 0 ? (
                                recentDatasets.map((ds) => (
                                    <div
                                        key={ds.id || ds.name}
                                        className="dataset-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate("/visualize", {
                                            state: {
                                                manualData: ds.rows,
                                                manualColumns: ds.columns,
                                                manualRowLabels: ds.rowLabels,
                                                datasetName: ds.name,
                                                category: ds.category,
                                            },
                                        })}
                                    >
                                        <div className="dataset-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                            </svg>
                                        </div>

                                        <div>
                                            <strong>{ds.name}</strong>
                                            <span>{Array.isArray(ds.rows) ? ds.rows.length : 0} rows - {ds.category || "General"}</span>
                                        </div>

                                        <b>→</b>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div
                                        className="dataset-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleOpenSampleDataset("Sales Performance", "Finance")}
                                    >
                                        <div className="dataset-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Sales Performance</strong>
                                            <span>Sample financial dataset</span>
                                        </div>
                                        <b>→</b>
                                    </div>

                                    <div
                                        className="dataset-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleOpenSampleDataset("Monthly Revenue", "Finance")}
                                    >
                                        <div className="dataset-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Monthly Revenue</strong>
                                            <span>Sample quarterly metrics</span>
                                        </div>
                                        <b>→</b>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;