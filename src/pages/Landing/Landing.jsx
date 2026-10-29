import { Link } from "react-router-dom";
import { getAuthSession } from "../../services/authService";
import "./Landing.css";

export default function Landing() {
    const session = getAuthSession();
    const isLoggedIn = !!session?.token;

    const authLink = (to) => (isLoggedIn ? to : "/login");
    const authState = (to) => (isLoggedIn ? undefined : { from: { pathname: to } });

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-navbar">
                <Link to="/" className="brand">
                    <div className="brand-logo">D</div>
                    <span>DataLens</span>
                </Link>

                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">Workflow</a>
                    <Link to={authLink("/dashboard")} state={authState("/dashboard")}>
                        Dashboard
                    </Link>
                    <Link to="/privacy">Privacy</Link>
                </div>

                <div className="nav-actions">
                    {isLoggedIn ? (
                        <Link to="/dashboard" className="btn btn-primary">
                            Open Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Create Account
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <section className="hero-section">
                    <div className="hero-content">
                        <span className="hero-badge">
                            Tabular Data Analysis &amp; Charting
                        </span>

                        <h1>
                            Structured data tables.
                            <br />
                            <span>Instant visualizations.</span>
                        </h1>

                        <p>
                            DataLens is a web-based analytical tool for managing tabular
                            datasets. Input rows manually or upload CSV and Excel files,
                            generate interactive charts, and log project focus time in a
                            secure workspace.
                        </p>

                        <div className="hero-actions">
                            <Link
                                to={authLink("/dataset/create")}
                                state={authState("/dataset/create")}
                                className="btn btn-primary hero-button"
                            >
                                Create Dataset
                            </Link>
                            <Link
                                to={authLink("/dashboard")}
                                state={authState("/dashboard")}
                                className="btn btn-secondary hero-button"
                            >
                                {isLoggedIn ? "Open Workspace" : "Sign In to Workspace"}
                            </Link>
                        </div>

                        <div className="hero-trust">
                            <span>CSV and Excel Import</span>
                            <span>Multiple Chart Formats</span>
                            <span>Local and Cloud Storage</span>
                        </div>
                    </div>

                    {/* Technical Mockup Preview */}
                    <div className="hero-visual">
                        <div className="dashboard-preview">
                            <div className="preview-header">
                                <div>
                                    <span className="preview-label">Dataset Preview</span>
                                    <h3>Quarterly Regional Performance</h3>
                                </div>
                                <span className="preview-period">4 Columns x 6 Rows</span>
                            </div>

                            <div className="preview-table-mini">
                                <div className="preview-table-row preview-table-head">
                                    <span>Quarter</span>
                                    <span>Region</span>
                                    <span>Units</span>
                                    <span>Revenue ($)</span>
                                </div>
                                <div className="preview-table-row">
                                    <span>Q1</span>
                                    <span>North</span>
                                    <span>320</span>
                                    <span>45,200</span>
                                </div>
                                <div className="preview-table-row">
                                    <span>Q2</span>
                                    <span>South</span>
                                    <span>285</span>
                                    <span>38,900</span>
                                </div>
                                <div className="preview-table-row">
                                    <span>Q3</span>
                                    <span>East</span>
                                    <span>410</span>
                                    <span>52,400</span>
                                </div>
                            </div>

                            <div className="chart-placeholder">
                                <div className="chart-grid">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <div className="chart-bars-simple">
                                    <div style={{ height: "45%" }}></div>
                                    <div style={{ height: "38%" }}></div>
                                    <div style={{ height: "65%" }}></div>
                                    <div style={{ height: "55%" }}></div>
                                    <div style={{ height: "80%" }}></div>
                                    <div style={{ height: "72%" }}></div>
                                </div>
                            </div>

                            <div className="chart-labels">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="features-section" id="features">
                    <div className="section-heading">
                        <span>Core Capabilities</span>
                        <h2>Engineered for tabular data workflows</h2>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-tech">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                                </svg>
                            </div>
                            <h3>Spreadsheet Grid Entry</h3>
                            <p>
                                Excel-style keyboard navigation with Tab and Enter keys,
                                customizable column headers, editable row labels, and
                                instant formula recalculations.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-tech">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 20V10M12 20V4M6 20v-6" />
                                </svg>
                            </div>
                            <h3>Interactive Visualizations</h3>
                            <p>
                                Render clean Bar, Line, Area, Pie, and Radar charts.
                                Select X and Y axes dynamically and export graphics in PNG
                                or PDF format.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-tech">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            </div>
                            <h3>File Import &amp; Export</h3>
                            <p>
                                Import spreadsheet data directly from CSV, Excel (.xlsx/.xls),
                                and JSON files. Export updated tables back to CSV or Excel anytime.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-tech">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Session Time Tracking</h3>
                            <p>
                                Track dedicated focus hours with an integrated stopwatch.
                                Daily sessions are saved to your account and visualized on a
                                14-day history chart.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Workflow */}
                <section className="how-section" id="how-it-works">
                    <div className="section-heading">
                        <span>Workflow</span>
                        <h2>From tabular rows to visual reports</h2>
                    </div>

                    <div className="steps">
                        <div className="step">
                            <span>01</span>
                            <h3>Enter or Import Data</h3>
                            <p>
                                Input data into the manual table grid or upload an existing CSV,
                                TSV, or Excel spreadsheet.
                            </p>
                        </div>

                        <div className="step">
                            <span>02</span>
                            <h3>Select Parameters</h3>
                            <p>
                                Assign metric columns, pick your chart type (Bar, Line, Area),
                                and preview statistical distributions.
                            </p>
                        </div>

                        <div className="step">
                            <span>03</span>
                            <h3>Save and Export</h3>
                            <p>
                                Persist datasets securely to your cloud database or download
                                high-resolution PNG charts and CSV files.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="landing-footer-top">
                    <div className="footer-brand-wrap">
                        <Link to="/" className="brand">
                            <div className="brand-logo">D</div>
                            <span>DataLens</span>
                        </Link>
                        <p>
                            Web-based tabular analysis, chart visualization, and session tracking.
                        </p>
                    </div>

                    <div className="footer-links-group">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <Link to={authLink("/dashboard")} state={authState("/dashboard")}>Dashboard</Link>
                            <Link to={authLink("/dataset/create")} state={authState("/dataset/create")}>New Dataset</Link>
                            <Link to={authLink("/visualize")} state={authState("/visualize")}>Visualize</Link>
                            <Link to={authLink("/stopwatch")} state={authState("/stopwatch")}>Time Tracker</Link>
                        </div>

                        <div className="footer-col">
                            <h4>Account</h4>
                            {isLoggedIn ? (
                                <>
                                    <Link to="/dashboard">Dashboard</Link>
                                    <Link to="/profile">Profile Settings</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">Sign In</Link>
                                    <Link to="/register">Register</Link>
                                    <Link to="/login" state={{ from: { pathname: "/profile" } }}>Profile Settings</Link>
                                </>
                            )}
                        </div>

                        <div className="footer-col">
                            <h4>Legal</h4>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms and Conditions</Link>
                        </div>
                    </div>
                </div>

                <div className="landing-footer-bottom">
                    <span>(c) 2026 DataLens. All rights reserved.</span>
                    <span>Tabular Analytics Workspace</span>
                </div>
            </footer>
        </div>
    );
}