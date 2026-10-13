import { Link, useNavigate } from "react-router-dom";
import { getAuthSession, clearAuthSession } from "../../services/authService";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const user = session?.user;
    const userName = user?.name || "Guest Analyst";
    const userRole = user?.role || (user ? "Data Analyst" : "Guest Mode");

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
                        <span>⌂</span>
                        Dashboard
                    </Link>

                    <Link to="/dataset/create" className="nav-item">
                        <span>＋</span>
                        Datasets
                    </Link>

                    <Link to="/compare" className="nav-item">
                        <span>⇄</span>
                        Compare
                    </Link>

                    <Link to="/stopwatch" className="nav-item">
                        <span>⏱</span>
                        Time Tracker
                    </Link>

                    <Link to="/profile" className="nav-item">
                        <span>◎</span>
                        Profile
                    </Link>

                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="sidebar-settings"
                        onClick={() => navigate(user ? "/profile" : "/login")}
                    >
                        ⚙ Settings
                    </button>

                    {user ? (
                        <button
                            className="sidebar-logout"
                            onClick={handleLogout}
                        >
                            ↪ Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="sidebar-logout"
                            style={{ textDecoration: "none", display: "block", textAlign: "center" }}
                        >
                            → Sign In
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
                            background: "rgba(99, 102, 241, 0.12)",
                            border: "1px solid rgba(99, 102, 241, 0.25)",
                            borderRadius: "14px",
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
                            <span style={{ fontSize: "18px" }}>☁️</span>
                            <span style={{ fontSize: "14px", color: "#e2e8f0" }}>
                                Exploring in <strong>Guest Mode</strong>. Datasets are only cached locally on this device.
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                                to="/register"
                                style={{
                                    background: "#6366f1",
                                    color: "#fff",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
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
                                    borderRadius: "8px",
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
                            Overview
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
                        <span>Good to see you again 👋</span>

                        <h2>
                            Let's turn your data into
                            <span> insights.</span>
                        </h2>

                        <p>
                            Analyze your datasets, compare performance
                            and discover meaningful trends.
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
                        <strong>12</strong>
                        <small>↑ 3 this month</small>
                    </div>

                    <div className="stat-card">
                        <span>Analyses Completed</span>
                        <strong>48</strong>
                        <small>↑ 12% from last month</small>
                    </div>

                    <div className="stat-card">
                        <span>Comparisons</span>
                        <strong>27</strong>
                        <small>↑ 8 this month</small>
                    </div>

                    <div className="stat-card">
                        <span>Insights Found</span>
                        <strong>94</strong>
                        <small>↑ 21% this month</small>
                    </div>

                </section>

                {/* Main Dashboard Grid */}
                <section className="dashboard-grid">

                    {/* Performance Chart */}
                    <div className="dashboard-panel chart-panel">

                        <div className="panel-header">
                            <div>
                                <span>Performance</span>
                                <h3>Dataset activity</h3>
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
                                <span>Library</span>
                                <h3>Recent datasets</h3>
                            </div>

                            <Link to="/dataset/create">
                                View all
                            </Link>
                        </div>

                        <div className="dataset-list">

                            <div
                                className="dataset-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleOpenSampleDataset("Sales Performance", "Finance")}
                            >
                                <div className="dataset-icon">📊</div>

                                <div>
                                    <strong>Sales Performance</strong>
                                    <span>Updated 2 hours ago</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div
                                className="dataset-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleOpenSampleDataset("Monthly Revenue", "Finance")}
                            >
                                <div className="dataset-icon">📈</div>

                                <div>
                                    <strong>Monthly Revenue</strong>
                                    <span>Updated yesterday</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div
                                className="dataset-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleOpenSampleDataset("Customer Growth", "Business")}
                            >
                                <div className="dataset-icon">👥</div>

                                <div>
                                    <strong>Customer Growth</strong>
                                    <span>Updated 3 days ago</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div
                                className="dataset-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleOpenSampleDataset("Expense Analysis", "Finance")}
                            >
                                <div className="dataset-icon">💰</div>

                                <div>
                                    <strong>Expense Analysis</strong>
                                    <span>Updated 5 days ago</span>
                                </div>

                                <b>→</b>
                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;