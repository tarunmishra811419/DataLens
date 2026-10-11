import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthSession, clearAuthSession } from "../../services/authService";
import { getSavedDatasets, deleteSavedDataset, getDatasetStats } from "../../services/datasetService";
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

    // Saved Datasets state
    const [datasets, setDatasets] = useState(() => getSavedDatasets());
    const [stats, setStats] = useState(() => getDatasetStats());
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        const handleDatasetsUpdated = () => {
            setDatasets(getSavedDatasets());
            setStats(getDatasetStats());
        };
        window.addEventListener("datalens_datasets_updated", handleDatasetsUpdated);
        return () => {
            window.removeEventListener("datalens_datasets_updated", handleDatasetsUpdated);
        };
    }, []);

    const categories = ["All", ...Array.from(new Set(datasets.map((d) => d.category || "General").filter(Boolean)))];

    const filteredDatasets = filterCategory === "All"
        ? datasets
        : datasets.filter((d) => (d.category || "General") === filterCategory);

    const handleEditDataset = (dataset) => {
        navigate("/dataset/manual", { state: { editDataset: dataset } });
    };

    const handleVisualizeDataset = (dataset) => {
        navigate("/visualize", {
            state: {
                manualData: dataset.rows,
                manualColumns: dataset.columns,
                manualRowLabels: dataset.rowLabels,
                datasetName: dataset.name,
                category: dataset.category,
            },
        });
    };

    const handleDeleteDataset = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete dataset "${name}"?`)) {
            await deleteSavedDataset(id);
            setDatasets(getSavedDatasets());
            setStats(getDatasetStats());
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "Recently";
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return "Recently";
        }
    };

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
                        <strong>{stats.totalDatasets}</strong>
                    </div>
                    <div className="profile-stat-box">
                        <span>Analyzed Rows</span>
                        <strong>{stats.totalRows.toLocaleString()}</strong>
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

                {/* ─── My Saved Datasets Section ─── */}
                <section className="profile-datasets-section">
                    <div className="profile-datasets-header">
                        <div className="profile-datasets-title-wrap">
                            <h2 className="profile-datasets-title">📁 My Saved Datasets</h2>
                            <span className="profile-count-pill">{datasets.length} Total</span>
                        </div>
                        <button
                            type="button"
                            className="profile-create-dataset-btn"
                            onClick={() => navigate("/dataset/manual")}
                        >
                            + Create New Dataset
                        </button>
                    </div>

                    {/* Category Filter Chips */}
                    {categories.length > 1 && (
                        <div className="profile-filter-row">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`profile-filter-chip${filterCategory === cat ? " active" : ""}`}
                                    onClick={() => setFilterCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Datasets Grid or Empty State */}
                    {filteredDatasets.length === 0 ? (
                        <div className="profile-empty-datasets">
                            <div className="profile-empty-datasets-icon">📊</div>
                            <h4>No datasets found</h4>
                            <p>
                                {datasets.length === 0
                                    ? "You haven't saved any datasets yet. Create one manually or import spreadsheet rows to build your collection."
                                    : `No datasets found matching category "${filterCategory}".`}
                            </p>
                            <button
                                type="button"
                                className="profile-create-dataset-btn"
                                onClick={() => navigate("/dataset/manual")}
                            >
                                + Create First Dataset
                            </button>
                        </div>
                    ) : (
                        <div className="profile-datasets-grid">
                            {filteredDatasets.map((ds) => {
                                const rowCount = Array.isArray(ds.rows) ? ds.rows.length : 0;
                                const colCount = Array.isArray(ds.columns) ? ds.columns.length : 0;
                                const dsId = ds.id || ds._id;
                                return (
                                    <div key={dsId} className="saved-dataset-card">
                                        <div className="dataset-card-top">
                                            <div className="dataset-card-info">
                                                <h3 className="dataset-card-name">{ds.name}</h3>
                                                <span className="dataset-category-tag">{ds.category || "General"}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="dataset-delete-icon-btn"
                                                onClick={() => handleDeleteDataset(dsId, ds.name)}
                                                title="Delete dataset"
                                            >
                                                🗑
                                            </button>
                                        </div>

                                        <div className="dataset-card-metrics">
                                            <div className="dataset-card-metric-item">
                                                <span>Rows:</span>
                                                <strong>{rowCount}</strong>
                                            </div>
                                            <div className="dataset-card-metric-item">
                                                <span>Cols:</span>
                                                <strong>{colCount}</strong>
                                            </div>
                                            <div className="dataset-card-metric-item">
                                                <span>Cells:</span>
                                                <strong>{rowCount * colCount}</strong>
                                            </div>
                                        </div>

                                        <div className="dataset-card-footer">
                                            <span className="dataset-date-text">
                                                Updated {formatDate(ds.updatedAt || ds.createdAt)}
                                            </span>
                                            <div className="dataset-action-buttons">
                                                <button
                                                    type="button"
                                                    className="dataset-btn-edit"
                                                    onClick={() => handleEditDataset(ds)}
                                                    title="Edit in spreadsheet editor"
                                                >
                                                    ✏ Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="dataset-btn-viz"
                                                    onClick={() => handleVisualizeDataset(ds)}
                                                    title="Visualize charts"
                                                >
                                                    📊 Visualize
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
