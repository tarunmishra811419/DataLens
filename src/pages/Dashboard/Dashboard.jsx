import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard-page">

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">
                    <div className="dashboard-logo">D</div>
                    <span>DataLens</span>
                </div>

                <nav className="dashboard-nav">

                    <a href="/dashboard" className="nav-item active">
                        <span>⌂</span>
                        Dashboard
                    </a>

                    <a href="/dataset/create" className="nav-item">
                        <span>＋</span>
                        Datasets
                    </a>

                    <a href="/compare" className="nav-item">
                        <span>⇄</span>
                        Compare
                    </a>

                    <a href="/profile" className="nav-item">
                        <span>◎</span>
                        Profile
                    </a>

                </nav>

                <div className="sidebar-bottom">
                    <button className="sidebar-settings">
                        ⚙ Settings
                    </button>

                    <button className="sidebar-logout">
                        ↪ Logout
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className="dashboard-main">

                {/* Top Bar */}
                <header className="dashboard-header">

                    <div>
                        <span className="dashboard-greeting">
                            Overview
                        </span>

                        <h1>Dashboard</h1>
                    </div>

                    <div className="dashboard-user">
                        <div className="user-avatar">
                            T
                        </div>

                        <div>
                            <strong>Tarun</strong>
                            <span>Data Analyst</span>
                        </div>
                    </div>

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

                    <a
                        href="/dataset/create"
                        className="dashboard-primary-button"
                    >
                        + Add Dataset
                    </a>

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

                            <a href="/dataset/create">
                                View all
                            </a>
                        </div>

                        <div className="dataset-list">

                            <div className="dataset-item">
                                <div className="dataset-icon">📊</div>

                                <div>
                                    <strong>Sales Performance</strong>
                                    <span>Updated 2 hours ago</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div className="dataset-item">
                                <div className="dataset-icon">📈</div>

                                <div>
                                    <strong>Monthly Revenue</strong>
                                    <span>Updated yesterday</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div className="dataset-item">
                                <div className="dataset-icon">👥</div>

                                <div>
                                    <strong>Customer Growth</strong>
                                    <span>Updated 3 days ago</span>
                                </div>

                                <b>→</b>
                            </div>

                            <div className="dataset-item">
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