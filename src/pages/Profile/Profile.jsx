import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthSession, clearAuthSession } from "../../services/authService";
import "./Profile.css";

export default function Profile() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const user = session?.user || {
        name: "Tarun Mishra",
        email: "tarunmishra811419@gmail.com",
    };

    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [highContrast, setHighContrast] = useState(false);

    const handleLogout = () => {
        clearAuthSession();
        navigate("/login");
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <header className="profile-header-bar">
                    <Link to="/dashboard" className="profile-back-link">
                        ← Back to Dashboard
                    </Link>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Account Settings & Profile</span>
                </header>

                {/* User Hero Card */}
                <section className="profile-card">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="profile-user-info">
                            <h1>{user.name}</h1>
                            <p>{user.email}</p>
                            <span className="profile-badge">● Active Analyst</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="profile-btn-logout" onClick={handleLogout}>
                            ↪ Log Out
                        </button>
                    </div>
                </section>

                {/* Analytics Stats */}
                <section className="profile-stats-grid">
                    <div className="profile-stat-box">
                        <span>Managed Datasets</span>
                        <strong>12</strong>
                    </div>
                    <div className="profile-stat-box">
                        <span>Analyzed Rows</span>
                        <strong>34,820</strong>
                    </div>
                    <div className="profile-stat-box">
                        <span>Visualizations Exported</span>
                        <strong>48</strong>
                    </div>
                    <div className="profile-stat-box">
                        <span>Active Streak</span>
                        <strong style={{ color: "#34d399" }}>14 Days 🔥</strong>
                    </div>
                </section>

                {/* Workspace Preferences */}
                <section className="profile-section">
                    <h3 className="profile-section-title">⚙ Workspace Preferences</h3>

                    <div className="profile-pref-row">
                        <div className="profile-pref-info">
                            <h4>Insight Engine Notifications</h4>
                            <p>Receive proactive notifications when anomaly spikes or streak milestones occur.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNotifications(!notifications)}
                            style={{
                                background: notifications ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                                border: `1px solid ${notifications ? "#10b981" : "rgba(255, 255, 255, 0.2)"}`,
                                color: notifications ? "#34d399" : "#94a3b8",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {notifications ? "Enabled ✓" : "Disabled"}
                        </button>
                    </div>

                    <div className="profile-pref-row">
                        <div className="profile-pref-info">
                            <h4>Continuous Dataset Auto-Save</h4>
                            <p>Automatically save manual grid cells and edits locally while you work.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAutoSave(!autoSave)}
                            style={{
                                background: autoSave ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                                border: `1px solid ${autoSave ? "#10b981" : "rgba(255, 255, 255, 0.2)"}`,
                                color: autoSave ? "#34d399" : "#94a3b8",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {autoSave ? "Enabled ✓" : "Disabled"}
                        </button>
                    </div>

                    <div className="profile-pref-row">
                        <div className="profile-pref-info">
                            <h4>High Contrast Data Grids</h4>
                            <p>Enhance cell border contrast and grid legibility for dense tables.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setHighContrast(!highContrast)}
                            style={{
                                background: highContrast ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                                border: `1px solid ${highContrast ? "#10b981" : "rgba(255, 255, 255, 0.2)"}`,
                                color: highContrast ? "#34d399" : "#94a3b8",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {highContrast ? "Enabled ✓" : "Disabled"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
