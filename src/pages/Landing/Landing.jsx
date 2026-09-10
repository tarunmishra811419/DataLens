import "./Landing.css";

function Landing() {
    return (
        <div className="landing-page">

            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="brand">
                    <div className="brand-logo">D</div>
                    <span>DataLens</span>
                </div>

                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it works</a>
                    <a href="#about">About</a>
                </div>

                <div className="nav-actions">
                    <button className="btn btn-secondary">Log in</button>
                    <button className="btn btn-primary">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main>

                <section className="hero-section">

                    <div className="hero-content">

                        <span className="hero-badge">
                            ✦ Turn your data into insights
                        </span>

                        <h1>
                            See your data.
                            <br />
                            <span>Understand your growth.</span>
                        </h1>

                        <p>
                            DataLens helps you compare, visualize and understand
                            your data through beautiful interactive charts and
                            meaningful insights.
                        </p>

                        <div className="hero-actions">
                            <button className="btn btn-primary hero-button">
                                Start Analyzing →
                            </button>

                            <button className="btn btn-secondary hero-button">
                                Explore Demo
                            </button>
                        </div>

                        <div className="hero-trust">
                            <span>✓ Easy to use</span>
                            <span>✓ Interactive charts</span>
                            <span>✓ Meaningful insights</span>
                        </div>

                    </div>

                    {/* Dashboard Preview */}
                    <div className="hero-visual">

                        <div className="dashboard-preview">

                            <div className="preview-header">
                                <div>
                                    <span className="preview-label">Overview</span>
                                    <h3>Your Performance</h3>
                                </div>

                                <span className="preview-period">Last 6 months ▾</span>
                            </div>

                            <div className="preview-stats">

                                <div className="preview-stat">
                                    <span>Total Value</span>
                                    <strong>₹84,500</strong>
                                    <small>↑ 18.4%</small>
                                </div>

                                <div className="preview-stat">
                                    <span>Average</span>
                                    <strong>₹14,083</strong>
                                    <small>↑ 8.2%</small>
                                </div>

                            </div>

                            <div className="chart-placeholder">

                                <div className="chart-grid">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <div className="chart-line">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
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
                        <span>POWERFUL & SIMPLE</span>

                        <h2>
                            Everything you need to
                            <br />
                            understand your data.
                        </h2>
                    </div>

                    <div className="features-grid">

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Visualize Data</h3>
                            <p>
                                Transform raw numbers into clear and interactive
                                visualizations.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚖️</div>
                            <h3>Compare Anything</h3>
                            <p>
                                Compare multiple datasets and instantly identify
                                changes and patterns.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📈</div>
                            <h3>Track Growth</h3>
                            <p>
                                Understand your progress with automatic growth and
                                performance calculations.
                            </p>
                        </div>

                    </div>

                </section>

                {/* How It Works */}
                <section className="how-section" id="how-it-works">

                    <div className="section-heading">
                        <span>HOW IT WORKS</span>

                        <h2>
                            From numbers to insights
                            <br />
                            in three simple steps.
                        </h2>
                    </div>

                    <div className="steps">

                        <div className="step">
                            <span>01</span>
                            <h3>Add your data</h3>
                            <p>
                                Enter or upload the data you want to analyze.
                            </p>
                        </div>

                        <div className="step">
                            <span>02</span>
                            <h3>Compare & visualize</h3>
                            <p>
                                Choose the metrics and charts you want to compare.
                            </p>
                        </div>

                        <div className="step">
                            <span>03</span>
                            <h3>Understand your results</h3>
                            <p>
                                Get meaningful statistics and insights from your data.
                            </p>
                        </div>

                    </div>

                </section>

            </main>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="brand">
                    <div className="brand-logo">D</div>
                    <span>DataLens</span>
                </div>

                <p>
                    Turn your data into insights.
                </p>

                <span>
                    © 2026 DataLens. All rights reserved.
                </span>
            </footer>

        </div>
    );
}

export default Landing;