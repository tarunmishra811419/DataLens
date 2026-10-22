import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getAuthSession,
    clearAuthSession,
    updateUserProfile,
    changeUserPassword,
} from "../../services/authService";
import {
    getSavedDatasets,
    deleteSavedDataset,
    getDatasetStats,
    getSavedComparisons,
    deleteSavedComparison,
} from "../../services/datasetService";
import "./Profile.css";

export default function Profile() {
    const navigate = useNavigate();
    const session = getAuthSession();
    const [user, setUser] = useState(() => session?.user || null);

    useEffect(() => {
        if (!session?.user) {
            navigate("/login", { replace: true });
        }
    }, [session, navigate]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: session?.user?.name || "",
        role: session?.user?.role || "Data Analyst",
        bio: session?.user?.bio || "",
        location: session?.user?.location || "",
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [pwForm, setPwForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });
    const [isSaving, setIsSaving] = useState(false);

    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [highContrast, setHighContrast] = useState(false);

    // Saved Datasets state
    const [datasets, setDatasets] = useState(() => getSavedDatasets());
    const [stats, setStats] = useState(() => getDatasetStats());
    const [filterCategory, setFilterCategory] = useState("All");

    // Saved Comparisons state
    const [comparisons, setComparisons] = useState(() => getSavedComparisons());

    useEffect(() => {
        const handleDatasetsUpdated = () => {
            setDatasets(getSavedDatasets());
            setStats(getDatasetStats());
        };
        const handleComparisonsUpdated = () => {
            setComparisons(getSavedComparisons());
        };
        window.addEventListener("datalens_datasets_updated", handleDatasetsUpdated);
        window.addEventListener("datalens_comparisons_updated", handleComparisonsUpdated);
        return () => {
            window.removeEventListener("datalens_datasets_updated", handleDatasetsUpdated);
            window.removeEventListener("datalens_comparisons_updated", handleComparisonsUpdated);
        };
    }, []);

    const showFeedback = (text, type = "success") => {
        setFeedbackMsg({ text, type });
        setTimeout(() => setFeedbackMsg({ text: "", type: "" }), 4000);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updated = await updateUserProfile({
                name: editForm.name,
                role: editForm.role,
                bio: editForm.bio,
                location: editForm.location,
            });
            setUser(updated);
            setIsEditingProfile(false);
            showFeedback("Profile successfully saved to database.", "success");
        } catch (err) {
            showFeedback(err.message || "Failed to save profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showFeedback("New passwords do not match", "error");
            return;
        }
        if (pwForm.newPassword.length < 6) {
            showFeedback("Password must be at least 6 characters", "error");
            return;
        }
        setIsSaving(true);
        try {
            await changeUserPassword(pwForm.currentPassword, pwForm.newPassword);
            setIsChangingPassword(false);
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            showFeedback("Password successfully updated.", "success");
        } catch (err) {
            showFeedback(err.message || "Failed to update password", "error");
        } finally {
            setIsSaving(false);
        }
    };

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
            showFeedback(`Dataset "${name}" deleted.`, "success");
        }
    };

    const handleOpenComparison = (comparison) => {
        navigate("/compare", { state: { loadComparison: comparison } });
    };

    const handleDeleteComparison = (id, title) => {
        if (window.confirm(`Are you sure you want to delete comparison "${title || "this comparison"}"?`)) {
            deleteSavedComparison(id);
            setComparisons(getSavedComparisons());
            showFeedback("Comparison report deleted.", "success");
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

    if (!user) {
        return (
            <div className="profile-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#94a3b8" }}>Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <header className="profile-header-bar">
                    <Link to="/dashboard" className="profile-back-link">
                        ← Back to Dashboard
                    </Link>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Account Settings & Profile</span>
                </header>

                {/* Status Toast */}
                {feedbackMsg.text && (
                    <div
                        style={{
                            padding: "12px 18px",
                            borderRadius: "6px",
                            marginBottom: "20px",
                            fontWeight: 600,
                            fontSize: "14px",
                            background:
                                feedbackMsg.type === "error"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(16, 185, 129, 0.15)",
                            border: `1px solid ${
                                feedbackMsg.type === "error" ? "#ef4444" : "#10b981"
                            }`,
                            color: feedbackMsg.type === "error" ? "#fca5a5" : "#6ee7b7",
                        }}
                    >
                        {feedbackMsg.text}
                    </div>
                )}

                {/* User Hero Card */}
                <section className="profile-card">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="profile-user-info">
                            <h1>{user.name}</h1>
                            <p>{user.email}</p>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "6px" }}>
                                <span className="profile-badge">{user.role || "Active Analyst"}</span>
                                {user.location && (
                                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {user.location}
                                    </span>
                                )}
                            </div>
                            {user.bio && (
                                <p style={{ marginTop: "8px", fontSize: "13px", color: "#cbd5e1" }}>
                                    "{user.bio}"
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="profile-btn-edit"
                            onClick={() => {
                                setIsEditingProfile(!isEditingProfile);
                                setIsChangingPassword(false);
                            }}
                        >
                            Edit Profile
                        </button>
                        <button
                            type="button"
                            className="profile-btn-pw"
                            onClick={() => {
                                setIsChangingPassword(!isChangingPassword);
                                setIsEditingProfile(false);
                            }}
                        >
                            Change Password
                        </button>
                        <button className="profile-btn-logout" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                </section>

                {/* Edit Profile Panel */}
                {isEditingProfile && (
                    <section className="profile-section" style={{ marginBottom: "28px" }}>
                        <h3 className="profile-section-title">Edit Profile Information</h3>
                        <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: "6px",
                                            color: "#fff",
                                            fontSize: "14px",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                        Role / Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        placeholder="e.g. Senior Data Analyst"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: "6px",
                                            color: "#fff",
                                            fontSize: "14px",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        placeholder="e.g. New Delhi, India"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: "6px",
                                            color: "#fff",
                                            fontSize: "14px",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                        Professional Bio
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        placeholder="Brief summary of your analytical focus"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: "6px",
                                            color: "#fff",
                                            fontSize: "14px",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        background: "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(false)}
                                    style={{
                                        background: "transparent",
                                        color: "#cbd5e1",
                                        border: "1px solid #334155",
                                        padding: "10px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Change Password Panel */}
                {isChangingPassword && (
                    <section className="profile-section" style={{ marginBottom: "28px" }}>
                        <h3 className="profile-section-title">Change Account Password</h3>
                        <form onSubmit={handleChangePassword} style={{ display: "grid", gap: "16px", maxWidth: "480px", marginTop: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={pwForm.currentPassword}
                                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        background: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "6px",
                                        color: "#fff",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                    New Password (min 6 characters)
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={pwForm.newPassword}
                                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        background: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "6px",
                                        color: "#fff",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={pwForm.confirmPassword}
                                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        background: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "6px",
                                        color: "#fff",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        background: "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    {isSaving ? "Updating..." : "Update Password"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    style={{
                                        background: "transparent",
                                        color: "#cbd5e1",
                                        border: "1px solid #334155",
                                        padding: "10px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}

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
                        <span>Saved Comparisons</span>
                        <strong>{comparisons.length}</strong>
                    </div>
                    <div className="profile-stat-box">
                        <span>Indexed Data Cells</span>
                        <strong>{stats.totalCells.toLocaleString()}</strong>
                    </div>
                </section>

                {/* ─── My Saved Datasets Section ─── */}
                <section className="profile-datasets-section">
                    <div className="profile-datasets-header">
                        <div className="profile-datasets-title-wrap">
                            <h2 className="profile-datasets-title">My Saved Datasets</h2>
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
                            <div className="profile-empty-datasets-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <h4>No datasets found</h4>
                            <p>
                                {datasets.length === 0
                                    ? "You have not saved any datasets yet. Create one manually or import spreadsheet rows to build your collection."
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
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
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
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="dataset-btn-viz"
                                                    onClick={() => handleVisualizeDataset(ds)}
                                                    title="Visualize charts"
                                                >
                                                    Visualize
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ─── Saved Comparisons Section ─── */}
                <section className="profile-datasets-section">
                    <div className="profile-datasets-header">
                        <div className="profile-datasets-title-wrap">
                            <h2 className="profile-datasets-title">Saved Comparisons & Reports</h2>
                            <span className="profile-count-pill">{comparisons.length} Total</span>
                        </div>
                        <button
                            type="button"
                            className="profile-create-dataset-btn"
                            onClick={() => navigate("/compare")}
                        >
                            + New Comparison
                        </button>
                    </div>

                    {comparisons.length === 0 ? (
                        <div className="profile-empty-datasets">
                            <div className="profile-empty-datasets-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="18" rx="2" />
                                    <line x1="12" y1="3" x2="12" y2="21" />
                                </svg>
                            </div>
                            <h4>No comparisons saved yet</h4>
                            <p>
                                Run a comparative analysis in the Comparison Studio and click "Save to Profile" to access and reload it here anytime.
                            </p>
                            <button
                                type="button"
                                className="profile-create-dataset-btn"
                                onClick={() => navigate("/compare")}
                            >
                                Open Comparison Studio
                            </button>
                        </div>
                    ) : (
                        <div className="profile-comparisons-grid">
                            {comparisons.map((cmp) => {
                                const nameA = cmp.datasetA?.name || cmp.manualA?.name || "Dataset A";
                                const nameB = cmp.datasetB?.name || cmp.manualB?.name || "Dataset B";
                                const revDelta = cmp.deltas?.revenue?.text || "0%";
                                const isPos = cmp.deltas?.revenue?.isPositive !== false;
                                const pointsCount = Array.isArray(cmp.seriesData) ? cmp.seriesData.length : 0;

                                return (
                                    <div key={cmp.id} className="saved-comparison-card">
                                        <div className="comparison-card-top">
                                            <div className="comparison-card-info">
                                                <h3 className="comparison-card-name">{cmp.title || `${nameA} vs ${nameB}`}</h3>
                                                <span className="comparison-mode-tag">
                                                    {cmp.mode === "manual" ? "Manual Live Entry" : "Preset Match"}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="dataset-delete-icon-btn"
                                                onClick={() => handleDeleteComparison(cmp.id, cmp.title)}
                                                title="Delete saved comparison"
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="comparison-card-targets">
                                            <div className="comparison-target-chip chip-a">
                                                <span className="target-dot-a" />
                                                <span>{nameA}</span>
                                            </div>
                                            <span className="comparison-vs-sep">vs</span>
                                            <div className="comparison-target-chip chip-b">
                                                <span className="target-dot-b" />
                                                <span>{nameB}</span>
                                            </div>
                                        </div>

                                        <div className="comparison-card-metrics">
                                            <div className="comparison-metric-stat">
                                                <span className="cmp-stat-label">Revenue Variance:</span>
                                                <span className={`cmp-stat-badge ${isPos ? "badge-pos" : "badge-neg"}`}>
                                                    {revDelta}
                                                </span>
                                            </div>
                                            {pointsCount > 0 && (
                                                <div className="comparison-metric-stat">
                                                    <span className="cmp-stat-label">Breakdown:</span>
                                                    <span className="cmp-stat-val">{pointsCount} categories</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="dataset-card-footer">
                                            <span className="dataset-date-text">
                                                Saved {formatDate(cmp.updatedAt || cmp.createdAt)}
                                            </span>
                                            <button
                                                type="button"
                                                className="comparison-btn-open"
                                                onClick={() => handleOpenComparison(cmp)}
                                            >
                                                Open in Studio →
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Workspace Preferences */}
                <section className="profile-section">
                    <h3 className="profile-section-title">Workspace Preferences</h3>

                    <div className="profile-pref-row">
                        <div className="profile-pref-info">
                            <h4>Insight Engine Notifications</h4>
                            <p>Receive proactive notifications when anomaly spikes or milestones occur.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNotifications(!notifications)}
                            style={{
                                background: notifications ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                                border: `1px solid ${notifications ? "#10b981" : "rgba(255, 255, 255, 0.2)"}`,
                                color: notifications ? "#34d399" : "#94a3b8",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {notifications ? "Enabled" : "Disabled"}
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
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {autoSave ? "Enabled" : "Disabled"}
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
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                            }}
                        >
                            {highContrast ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
