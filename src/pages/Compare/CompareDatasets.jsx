import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    ArrowLeft,
    TrendingUp,
    Target,
    Users,
    Plus,
    Trash2,
    Sliders,
    Database,
    Save,
    RotateCcw,
    Check,
    Bookmark,
    X,
} from "lucide-react";
import { getSavedDatasets, saveDataset, saveComparison } from "../../services/datasetService";
import "./CompareDatasets.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const SAMPLE_DATASETS = {
    q1_sales: {
        id: "q1_sales",
        name: "Q1 Sales Performance",
        period: "Jan - Mar 2026",
        metrics: {
            revenue: 124500,
            units: 840,
            avgOrder: 148.2,
            activeUsers: 3420,
        },
        monthlyData: [
            { label: "Month 1", value: 38000 },
            { label: "Month 2", value: 41500 },
            { label: "Month 3", value: 45000 },
        ],
    },
    q2_sales: {
        id: "q2_sales",
        name: "Q2 Sales Performance",
        period: "Apr - Jun 2026",
        metrics: {
            revenue: 148200,
            units: 980,
            avgOrder: 151.2,
            activeUsers: 4190,
        },
        monthlyData: [
            { label: "Month 1", value: 46200 },
            { label: "Month 2", value: 49800 },
            { label: "Month 3", value: 52200 },
        ],
    },
    marketing_camp_a: {
        id: "marketing_camp_a",
        name: "Marketing Campaign Alpha",
        period: "Social Ads",
        metrics: {
            revenue: 95400,
            units: 620,
            avgOrder: 153.8,
            activeUsers: 2850,
        },
        monthlyData: [
            { label: "Month 1", value: 29000 },
            { label: "Month 2", value: 32400 },
            { label: "Month 3", value: 34000 },
        ],
    },
    marketing_camp_b: {
        id: "marketing_camp_b",
        name: "Marketing Campaign Beta",
        period: "Search & Display",
        metrics: {
            revenue: 112000,
            units: 750,
            avgOrder: 149.3,
            activeUsers: 3600,
        },
        monthlyData: [
            { label: "Month 1", value: 33000 },
            { label: "Month 2", value: 37500 },
            { label: "Month 3", value: 41500 },
        ],
    },
};

function calcDelta(a, b) {
    const numA = Number(a) || 0;
    const numB = Number(b) || 0;
    if (!numA && !numB) return { pct: 0, text: "0%" };
    if (!numA) return { pct: 100, text: "+100%" };
    const diff = numB - numA;
    const pct = ((diff / numA) * 100).toFixed(1);
    return {
        pct: Number(pct),
        text: `${Number(pct) > 0 ? "+" : ""}${pct}%`,
        isPositive: Number(pct) >= 0,
    };
}

export default function CompareDatasets() {
    const location = useLocation();

    const initialComparison = location.state?.loadComparison;

    // Mode: 'preset' (choose from sample/saved datasets) or 'manual' (interactive live entry)
    const [mode, setMode] = useState(() => initialComparison?.mode || "manual");
    const [savedDatasets, setSavedDatasets] = useState(() => {
        try {
            return getSavedDatasets() || [];
        } catch {
            return [];
        }
    });
    const [saveStatus, setSaveStatus] = useState(() =>
        initialComparison ? `Loaded comparison report: "${initialComparison.title || "Custom Comparison"}"` : null
    );

    // Preset selection IDs
    const [datasetAId, setDatasetAId] = useState(() => initialComparison?.datasetA?.id || "q1_sales");
    const [datasetBId, setDatasetBId] = useState(() => initialComparison?.datasetB?.id || "q2_sales");

    // Manual Entry State for Dataset A & Dataset B
    const [manualA, setManualA] = useState(() => initialComparison?.manualA || {
        name: "Dataset A (Baseline)",
        period: "Period 1",
        revenue: 124500,
        units: 840,
        avgOrder: 148.2,
        activeUsers: 3420,
    });

    const [manualB, setManualB] = useState(() => initialComparison?.manualB || {
        name: "Dataset B (Comparison)",
        period: "Period 2",
        revenue: 148200,
        units: 980,
        avgOrder: 151.2,
        activeUsers: 4190,
    });

    // Breakdown progression for the chart
    const [seriesData, setSeriesData] = useState(() => initialComparison?.seriesData || [
        { label: "Category 1", valA: 38000, valB: 46200 },
        { label: "Category 2", valA: 41500, valB: 49800 },
        { label: "Category 3", valA: 45000, valB: 52200 },
        { label: "Category 4", valA: 42000, valB: 48500 },
    ]);


    // Keep saved datasets synchronized with custom events
    useEffect(() => {
        const handleUpdate = () => {
            try {
                setSavedDatasets(getSavedDatasets() || []);
            } catch (err) {
                console.error("Failed to sync datasets", err);
            }
        };

        window.addEventListener("datalens_datasets_updated", handleUpdate);
        return () => window.removeEventListener("datalens_datasets_updated", handleUpdate);
    }, []);

    // Active Dataset references based on current mode
    const activeDataA = useMemo(() => {
        if (mode === "manual") {
            return {
                id: "manual_a",
                name: manualA.name || "Dataset A",
                period: manualA.period || "Baseline",
                metrics: {
                    revenue: Number(manualA.revenue) || 0,
                    units: Number(manualA.units) || 0,
                    avgOrder: Number(manualA.avgOrder) || 0,
                    activeUsers: Number(manualA.activeUsers) || 0,
                },
                monthlyData: seriesData.map((s) => ({
                    label: s.label,
                    value: Number(s.valA) || 0,
                })),
            };
        }
        return SAMPLE_DATASETS[datasetAId] || SAMPLE_DATASETS.q1_sales;
    }, [mode, manualA, seriesData, datasetAId]);

    const activeDataB = useMemo(() => {
        if (mode === "manual") {
            return {
                id: "manual_b",
                name: manualB.name || "Dataset B",
                period: manualB.period || "Comparison",
                metrics: {
                    revenue: Number(manualB.revenue) || 0,
                    units: Number(manualB.units) || 0,
                    avgOrder: Number(manualB.avgOrder) || 0,
                    activeUsers: Number(manualB.activeUsers) || 0,
                },
                monthlyData: seriesData.map((s) => ({
                    label: s.label,
                    value: Number(s.valB) || 0,
                })),
            };
        }
        return SAMPLE_DATASETS[datasetBId] || SAMPLE_DATASETS.q2_sales;
    }, [mode, manualB, seriesData, datasetBId]);

    // Computed percentage deltas
    const revenueDelta = useMemo(
        () => calcDelta(activeDataA.metrics.revenue, activeDataB.metrics.revenue),
        [activeDataA, activeDataB]
    );
    const unitsDelta = useMemo(
        () => calcDelta(activeDataA.metrics.units, activeDataB.metrics.units),
        [activeDataA, activeDataB]
    );
    const avgOrderDelta = useMemo(
        () => calcDelta(activeDataA.metrics.avgOrder, activeDataB.metrics.avgOrder),
        [activeDataA, activeDataB]
    );
    const usersDelta = useMemo(
        () => calcDelta(activeDataA.metrics.activeUsers, activeDataB.metrics.activeUsers),
        [activeDataA, activeDataB]
    );

    // Chart configuration
    const chartLabels = useMemo(
        () => activeDataA.monthlyData.map((d) => d.label || "Item"),
        [activeDataA]
    );

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: activeDataA.name,
                data: activeDataA.monthlyData.map((d) => d.value),
                backgroundColor: "rgba(37, 99, 235, 0.85)",
                borderColor: "#2563eb",
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: activeDataB.name,
                data: activeDataB.monthlyData.map((d) => d.value),
                backgroundColor: "rgba(16, 185, 129, 0.85)",
                borderColor: "#10b981",
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: "#94a3b8",
                    font: { family: "Inter", size: 12 },
                    boxWidth: 14,
                    boxHeight: 14,
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
                borderColor: "#1e293b",
                borderWidth: 1,
                padding: 10,
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8", font: { family: "Inter" } },
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8", font: { family: "Inter" } },
            },
        },
    };

    // Series manipulation handlers for manual entry
    const handleAddRow = () => {
        setSeriesData((prev) => [
            ...prev,
            {
                label: `Category ${prev.length + 1}`,
                valA: 40000,
                valB: 45000,
            },
        ]);
    };

    const handleRemoveRow = (index) => {
        if (seriesData.length <= 1) return;
        setSeriesData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSeriesChange = (index, field, value) => {
        setSeriesData((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Auto-calculate revenue total from chart series rows
    const handleAutoSumRevenue = () => {
        const sumA = seriesData.reduce((acc, row) => acc + (Number(row.valA) || 0), 0);
        const sumB = seriesData.reduce((acc, row) => acc + (Number(row.valB) || 0), 0);
        setManualA((prev) => ({ ...prev, revenue: sumA }));
        setManualB((prev) => ({ ...prev, revenue: sumB }));
    };

    // Reset manual data to sample template
    const handleResetManual = () => {
        setManualA({
            name: "Baseline Group",
            period: "Period 1",
            revenue: 120000,
            units: 800,
            avgOrder: 150.0,
            activeUsers: 3000,
        });
        setManualB({
            name: "Comparison Group",
            period: "Period 2",
            revenue: 145000,
            units: 950,
            avgOrder: 152.6,
            activeUsers: 3900,
        });
        setSeriesData([
            { label: "Segment 1", valA: 30000, valB: 35000 },
            { label: "Segment 2", valA: 42000, valB: 50000 },
            { label: "Segment 3", valA: 48000, valB: 60000 },
        ]);
    };

    // Save manual dataset to LocalStorage
    const handleSaveDataset = (datasetNum) => {
        const isA = datasetNum === "A";
        const target = isA ? activeDataA : activeDataB;
        try {
            const datasetToSave = {
                id: `manual_cmp_${Date.now()}_${isA ? "a" : "b"}`,
                name: target.name,
                category: "Comparative Analysis",
                source: "manual",
                columns: ["Category", "Value"],
                rows: target.monthlyData.map((d) => ({
                    Category: d.label,
                    Value: String(d.value),
                })),
                metrics: target.metrics,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            saveDataset(datasetToSave);
            setSaveStatus(`Saved "${target.name}" to your workspace!`);
            setTimeout(() => setSaveStatus(null), 3000);
        } catch {
            setSaveStatus("Failed to save dataset locally.");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [customCmpTitle, setCustomCmpTitle] = useState("");

    const handleOpenSaveModal = () => {
        setCustomCmpTitle(`${activeDataA.name} vs ${activeDataB.name}`);
        setShowSaveModal(true);
    };

    // Save complete comparison report to user's profile
    const handleConfirmSaveToProfile = (e) => {
        if (e) e.preventDefault();
        const finalTitle = customCmpTitle.trim() || `${activeDataA.name} vs ${activeDataB.name}`;

        try {
            const report = {
                id: location.state?.loadComparison?.id || `cmp_${Date.now()}`,
                title: finalTitle,
                mode,
                datasetA: {
                    id: activeDataA.id,
                    name: activeDataA.name,
                    period: activeDataA.period,
                    metrics: activeDataA.metrics,
                },
                datasetB: {
                    id: activeDataB.id,
                    name: activeDataB.name,
                    period: activeDataB.period,
                    metrics: activeDataB.metrics,
                },
                manualA,
                manualB,
                seriesData,
                deltas: {
                    revenue: revenueDelta,
                    units: unitsDelta,
                    avgOrder: avgOrderDelta,
                    activeUsers: usersDelta,
                },
            };

            saveComparison(report);
            setShowSaveModal(false);
            setSaveStatus(`Comparison "${report.title}" saved to your profile!`);
            setTimeout(() => setSaveStatus(null), 4000);
        } catch {
            setSaveStatus("Failed to save comparison to profile.");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    return (
        <div className="compare-page" key={location.key}>
            <div className="compare-container">
                {/* Header */}
                <header className="compare-header">
                    <div className="compare-header-left">
                        <Link to="/dashboard" className="compare-back-btn">
                            <ArrowLeft size={16} />
                            <span>Dashboard</span>
                        </Link>
                        <div>
                            <div className="compare-tag">Comparative Analytics</div>
                            <h1 className="compare-title">Dataset Comparison</h1>
                            <p className="compare-subtitle">
                                Compare performance, variance, and trends using presets or live manual entry.
                            </p>
                        </div>
                    </div>

                    <div className="compare-header-right">
                        <button
                            type="button"
                            className="compare-save-profile-btn"
                            onClick={handleOpenSaveModal}
                            title="Save this comparative report to your Profile"
                        >
                            <Bookmark size={15} />
                            <span>Save to Profile</span>
                        </button>

                        {/* Mode Toggle Buttons */}
                        <div className="compare-mode-switch">
                            <button
                                type="button"
                                className={`compare-mode-btn ${mode === "manual" ? "active" : ""}`}
                                onClick={() => setMode("manual")}
                            >
                                <Sliders size={15} />
                                <span>Manual Data Entry</span>
                            </button>
                            <button
                                type="button"
                                className={`compare-mode-btn ${mode === "preset" ? "active" : ""}`}
                                onClick={() => setMode("preset")}
                            >
                                <Database size={15} />
                                <span>Preset Datasets</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Save status notification banner */}
                {saveStatus && (
                    <div className="compare-notification">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Check size={16} />
                            <span>{saveStatus}</span>
                        </div>
                        <Link to="/profile" className="notification-profile-link">
                            View in Profile →
                        </Link>
                    </div>
                )}

                {/* MODE 1: PRESET SELECTION ROW */}
                {mode === "preset" && (
                    <section className="compare-selectors-grid">
                        <div className="compare-card-selector">
                            <div className="compare-card-label label-a">
                                <span className="label-dot dot-a" /> Dataset A (Baseline)
                            </div>
                            <select
                                className="compare-select"
                                value={datasetAId}
                                onChange={(e) => setDatasetAId(e.target.value)}
                            >
                                <optgroup label="Standard Presets">
                                    {Object.values(SAMPLE_DATASETS).map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.period})
                                        </option>
                                    ))}
                                </optgroup>
                                {savedDatasets.length > 0 && (
                                    <optgroup label="Your Saved Datasets">
                                        {savedDatasets.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        <div className="compare-vs-badge">VS</div>

                        <div className="compare-card-selector">
                            <div className="compare-card-label label-b">
                                <span className="label-dot dot-b" /> Dataset B (Comparison)
                            </div>
                            <select
                                className="compare-select"
                                value={datasetBId}
                                onChange={(e) => setDatasetBId(e.target.value)}
                            >
                                <optgroup label="Standard Presets">
                                    {Object.values(SAMPLE_DATASETS).map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.period})
                                        </option>
                                    ))}
                                </optgroup>
                                {savedDatasets.length > 0 && (
                                    <optgroup label="Your Saved Datasets">
                                        {savedDatasets.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                    </section>
                )}

                {/* MODE 2: MANUAL DATA ENTRY BLOCK */}
                {mode === "manual" && (
                    <section className="manual-entry-panel">
                        <div className="manual-entry-header">
                            <div>
                                <h2 className="manual-entry-title">Manual Data Entry & Live Variance</h2>
                                <p className="manual-entry-desc">
                                    Edit names, summary KPIs, and category values below. Charts and deltas recalculate in real time.
                                </p>
                            </div>
                            <div className="manual-actions-row">
                                <button
                                    type="button"
                                    className="manual-action-btn"
                                    onClick={handleAutoSumRevenue}
                                    title="Compute total revenue by summing all category rows"
                                >
                                    Auto-Sum Revenue
                                </button>
                                <button
                                    type="button"
                                    className="manual-action-btn"
                                    onClick={handleResetManual}
                                    title="Reset entries to template"
                                >
                                    <RotateCcw size={14} />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>

                        {/* Top Metadata & Summary Inputs (Dataset A vs Dataset B) */}
                        <div className="manual-comparison-grid">
                            {/* Column A */}
                            <div className="manual-dataset-card card-border-a">
                                <div className="manual-dataset-badge badge-a">
                                    <span className="label-dot dot-a" />
                                    <span>Dataset A (Baseline)</span>
                                </div>

                                <div className="manual-input-grid">
                                    <div className="manual-field-group">
                                        <label htmlFor="name-a">Dataset Label</label>
                                        <input
                                            id="name-a"
                                            type="text"
                                            value={manualA.name}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            placeholder="e.g. Q1 Baseline"
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="period-a">Period / Scope</label>
                                        <input
                                            id="period-a"
                                            type="text"
                                            value={manualA.period}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, period: e.target.value }))
                                            }
                                            placeholder="e.g. 2025"
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="rev-a">Total Revenue (₹)</label>
                                        <input
                                            id="rev-a"
                                            type="number"
                                            value={manualA.revenue}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, revenue: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="units-a">Units Sold</label>
                                        <input
                                            id="units-a"
                                            type="number"
                                            value={manualA.units}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, units: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="order-a">Avg Order Value (₹)</label>
                                        <input
                                            id="order-a"
                                            type="number"
                                            step="0.1"
                                            value={manualA.avgOrder}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, avgOrder: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="users-a">Active Reach / Users</label>
                                        <input
                                            id="users-a"
                                            type="number"
                                            value={manualA.activeUsers}
                                            onChange={(e) =>
                                                setManualA((prev) => ({ ...prev, activeUsers: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="save-dataset-inline-btn"
                                    onClick={() => handleSaveDataset("A")}
                                >
                                    <Save size={14} />
                                    <span>Save Dataset A Locally</span>
                                </button>
                            </div>

                            {/* Column B */}
                            <div className="manual-dataset-card card-border-b">
                                <div className="manual-dataset-badge badge-b">
                                    <span className="label-dot dot-b" />
                                    <span>Dataset B (Comparison)</span>
                                </div>

                                <div className="manual-input-grid">
                                    <div className="manual-field-group">
                                        <label htmlFor="name-b">Dataset Label</label>
                                        <input
                                            id="name-b"
                                            type="text"
                                            value={manualB.name}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            placeholder="e.g. Q2 Actual"
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="period-b">Period / Scope</label>
                                        <input
                                            id="period-b"
                                            type="text"
                                            value={manualB.period}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, period: e.target.value }))
                                            }
                                            placeholder="e.g. 2026"
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="rev-b">Total Revenue (₹)</label>
                                        <input
                                            id="rev-b"
                                            type="number"
                                            value={manualB.revenue}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, revenue: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="units-b">Units Sold</label>
                                        <input
                                            id="units-b"
                                            type="number"
                                            value={manualB.units}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, units: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="order-b">Avg Order Value (₹)</label>
                                        <input
                                            id="order-b"
                                            type="number"
                                            step="0.1"
                                            value={manualB.avgOrder}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, avgOrder: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="manual-field-group">
                                        <label htmlFor="users-b">Active Reach / Users</label>
                                        <input
                                            id="users-b"
                                            type="number"
                                            value={manualB.activeUsers}
                                            onChange={(e) =>
                                                setManualB((prev) => ({ ...prev, activeUsers: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="save-dataset-inline-btn"
                                    onClick={() => handleSaveDataset("B")}
                                >
                                    <Save size={14} />
                                    <span>Save Dataset B Locally</span>
                                </button>
                            </div>
                        </div>

                        {/* Chart Progression Table */}
                        <div className="manual-series-block">
                            <div className="manual-series-header">
                                <div>
                                    <h3 className="manual-series-title">Category / Period Progression (Chart Data)</h3>
                                    <p className="manual-series-subtitle">
                                        Add categories, segments, or months to compare directly in the bar chart.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="add-series-btn"
                                    onClick={handleAddRow}
                                >
                                    <Plus size={14} />
                                    <span>Add Category Row</span>
                                </button>
                            </div>

                            <div className="manual-table-wrapper">
                                <table className="manual-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Category / Period Name</th>
                                            <th>{manualA.name || "Dataset A"} Value</th>
                                            <th>{manualB.name || "Dataset B"} Value</th>
                                            <th>Variance</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {seriesData.map((row, idx) => {
                                            const rowDelta = calcDelta(row.valA, row.valB);
                                            return (
                                                <tr key={idx}>
                                                    <td className="row-num">{idx + 1}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="table-input"
                                                            value={row.label}
                                                            onChange={(e) =>
                                                                handleSeriesChange(idx, "label", e.target.value)
                                                            }
                                                            placeholder="e.g. Month or Category"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="table-input"
                                                            value={row.valA}
                                                            onChange={(e) =>
                                                                handleSeriesChange(idx, "valA", e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="table-input"
                                                            value={row.valB}
                                                            onChange={(e) =>
                                                                handleSeriesChange(idx, "valB", e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`table-delta ${
                                                                rowDelta.pct > 0
                                                                    ? "delta-positive"
                                                                    : rowDelta.pct < 0
                                                                    ? "delta-negative"
                                                                    : "delta-neutral"
                                                            }`}
                                                        >
                                                            {rowDelta.text}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="table-delete-btn"
                                                            onClick={() => handleRemoveRow(idx)}
                                                            disabled={seriesData.length <= 1}
                                                            title="Delete this row"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* Key Metrics Comparison Row */}
                <section className="compare-metrics-row">
                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Total Revenue</div>
                        <div className="compare-metric-values">
                            <span className="val-a">₹{Number(activeDataA.metrics.revenue).toLocaleString()}</span>
                            <span className="val-b">₹{Number(activeDataB.metrics.revenue).toLocaleString()}</span>
                        </div>
                        <span
                            className={`compare-delta-badge ${
                                revenueDelta.pct > 0
                                    ? "delta-positive"
                                    : revenueDelta.pct < 0
                                    ? "delta-negative"
                                    : "delta-neutral"
                            }`}
                        >
                            {revenueDelta.pct > 0 ? "↑" : revenueDelta.pct < 0 ? "↓" : "→"} {revenueDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Units Sold</div>
                        <div className="compare-metric-values">
                            <span className="val-a">{Number(activeDataA.metrics.units).toLocaleString()}</span>
                            <span className="val-b">{Number(activeDataB.metrics.units).toLocaleString()}</span>
                        </div>
                        <span
                            className={`compare-delta-badge ${
                                unitsDelta.pct > 0
                                    ? "delta-positive"
                                    : unitsDelta.pct < 0
                                    ? "delta-negative"
                                    : "delta-neutral"
                            }`}
                        >
                            {unitsDelta.pct > 0 ? "↑" : unitsDelta.pct < 0 ? "↓" : "→"} {unitsDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Average Order Value</div>
                        <div className="compare-metric-values">
                            <span className="val-a">₹{Number(activeDataA.metrics.avgOrder).toLocaleString()}</span>
                            <span className="val-b">₹{Number(activeDataB.metrics.avgOrder).toLocaleString()}</span>
                        </div>
                        <span
                            className={`compare-delta-badge ${
                                avgOrderDelta.pct > 0
                                    ? "delta-positive"
                                    : avgOrderDelta.pct < 0
                                    ? "delta-negative"
                                    : "delta-neutral"
                            }`}
                        >
                            {avgOrderDelta.pct > 0 ? "↑" : avgOrderDelta.pct < 0 ? "↓" : "→"} {avgOrderDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Active Reach / Users</div>
                        <div className="compare-metric-values">
                            <span className="val-a">{Number(activeDataA.metrics.activeUsers).toLocaleString()}</span>
                            <span className="val-b">{Number(activeDataB.metrics.activeUsers).toLocaleString()}</span>
                        </div>
                        <span
                            className={`compare-delta-badge ${
                                usersDelta.pct > 0
                                    ? "delta-positive"
                                    : usersDelta.pct < 0
                                    ? "delta-negative"
                                    : "delta-neutral"
                            }`}
                        >
                            {usersDelta.pct > 0 ? "↑" : usersDelta.pct < 0 ? "↓" : "→"} {usersDelta.text}
                        </span>
                    </div>
                </section>

                {/* Comparative Chart */}
                <section className="compare-chart-panel">
                    <div className="compare-chart-header">
                        <div>
                            <h3>Comparative Distribution Chart</h3>
                            <span className="compare-chart-sub">
                                Visual variance between {activeDataA.name} and {activeDataB.name}
                            </span>
                        </div>
                        <div className="chart-legend-pill">
                            <span className="legend-indicator ind-a" /> {activeDataA.name}
                            <span className="legend-divider" />
                            <span className="legend-indicator ind-b" /> {activeDataB.name}
                        </div>
                    </div>
                    <div className="compare-chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* AI Insights & Differences */}
                <section className="compare-insights-panel">
                    <h3 className="compare-insights-title">Comparative Analysis & Takeaways</h3>
                    <div className="compare-insights-grid">
                        <div className="compare-insight-card highlight">
                            <div className="compare-insight-icon icon-blue">
                                <TrendingUp size={20} />
                            </div>
                            <div className="compare-insight-text">
                                <h4>Growth Trajectory</h4>
                                <p>
                                    {activeDataB.name} demonstrated a <strong>{revenueDelta.text}</strong> variance in revenue compared to {activeDataA.name}.
                                </p>
                            </div>
                        </div>

                        <div className="compare-insight-card">
                            <div className="compare-insight-icon icon-emerald">
                                <Target size={20} />
                            </div>
                            <div className="compare-insight-text">
                                <h4>Volume & Unit Dynamics</h4>
                                <p>
                                    Volume registered at <strong>{unitsDelta.text}</strong> units with an average ticket variance of <strong>{avgOrderDelta.text}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="compare-insight-card">
                            <div className="compare-insight-icon icon-slate">
                                <Users size={20} />
                            </div>
                            <div className="compare-insight-text">
                                <h4>Audience & Reach</h4>
                                <p>
                                    Active audience size tracked at <strong>{Number(activeDataB.metrics.activeUsers).toLocaleString()}</strong> ({usersDelta.text} relative to baseline).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal Dialog for Saving Comparison to Profile */}
            {showSaveModal && (
                <div className="compare-modal-backdrop" onClick={() => setShowSaveModal(false)}>
                    <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="compare-modal-header">
                            <div className="compare-modal-title-group">
                                <Bookmark size={18} className="compare-modal-icon" />
                                <h3>Save Comparison to Profile</h3>
                            </div>
                            <button
                                type="button"
                                className="compare-modal-close"
                                onClick={() => setShowSaveModal(false)}
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmSaveToProfile} className="compare-modal-form">
                            <p className="compare-modal-desc">
                                Name this report to store its key metrics, visual delta series, and input data in your profile account.
                            </p>
                            <div className="compare-modal-field">
                                <label htmlFor="cmp-title-input">Report Title</label>
                                <input
                                    id="cmp-title-input"
                                    type="text"
                                    value={customCmpTitle}
                                    onChange={(e) => setCustomCmpTitle(e.target.value)}
                                    placeholder="e.g. Q1 vs Q2 Performance Review"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="compare-modal-summary-box">
                                <div className="summary-item">
                                    <span className="summary-label">Dataset A:</span>
                                    <span className="summary-val">{activeDataA.name}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Dataset B:</span>
                                    <span className="summary-val">{activeDataB.name}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Mode:</span>
                                    <span className="summary-val">{mode === "manual" ? "Manual Data Entry" : "Preset Datasets"}</span>
                                </div>
                            </div>
                            <div className="compare-modal-actions">
                                <button
                                    type="button"
                                    className="compare-modal-btn cancel"
                                    onClick={() => setShowSaveModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="compare-modal-btn confirm"
                                >
                                    <Save size={15} />
                                    <span>Save Report</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
