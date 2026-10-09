import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    if (!a && !b) return { pct: 0, text: "0%" };
    if (!a) return { pct: 100, text: "+100%" };
    const diff = b - a;
    const pct = ((diff / a) * 100).toFixed(1);
    return {
        pct: Number(pct),
        text: `${pct > 0 ? "+" : ""}${pct}%`,
        isPositive: pct >= 0,
    };
}

export default function CompareDatasets() {
    const navigate = useNavigate();
    const [datasetAId, setDatasetAId] = useState("q1_sales");
    const [datasetBId, setDatasetBId] = useState("q2_sales");

    const datasetA = SAMPLE_DATASETS[datasetAId];
    const datasetB = SAMPLE_DATASETS[datasetBId];

    const revenueDelta = useMemo(() => calcDelta(datasetA.metrics.revenue, datasetB.metrics.revenue), [datasetA, datasetB]);
    const unitsDelta = useMemo(() => calcDelta(datasetA.metrics.units, datasetB.metrics.units), [datasetA, datasetB]);
    const avgOrderDelta = useMemo(() => calcDelta(datasetA.metrics.avgOrder, datasetB.metrics.avgOrder), [datasetA, datasetB]);
    const usersDelta = useMemo(() => calcDelta(datasetA.metrics.activeUsers, datasetB.metrics.activeUsers), [datasetA, datasetB]);

    const chartData = {
        labels: ["Month 1", "Month 2", "Month 3"],
        datasets: [
            {
                label: datasetA.name,
                data: datasetA.monthlyData.map(d => d.value),
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderRadius: 6,
            },
            {
                label: datasetB.name,
                data: datasetB.monthlyData.map(d => d.value),
                backgroundColor: "rgba(16, 185, 129, 0.8)",
                borderRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: { color: "#94a3b8", font: { family: "Inter" } },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8" },
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8" },
            },
        },
    };

    return (
        <div className="compare-page">
            <div className="compare-container">
                {/* Header */}
                <header className="compare-header">
                    <div className="compare-header-left">
                        <Link to="/dashboard" className="compare-back-btn">
                            ← Dashboard
                        </Link>
                        <div>
                            <span className="compare-badge">⇄ Comparative Analytics</span>
                            <h1 className="compare-title">Dataset Comparison</h1>
                            <p className="compare-subtitle">Compare performance, variance, and trends across two datasets.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/dataset/create")}
                        className="compare-back-btn"
                        style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none" }}
                    >
                        + Add New Dataset
                    </button>
                </header>

                {/* Dataset Selectors */}
                <section className="compare-selectors-grid">
                    <div className="compare-card-selector">
                        <div className="compare-card-label label-a">
                            <span>●</span> Dataset A (Baseline)
                        </div>
                        <select
                            className="compare-select"
                            value={datasetAId}
                            onChange={(e) => setDatasetAId(e.target.value)}
                        >
                            {Object.values(SAMPLE_DATASETS).map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.period})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="compare-vs-pill">VS</div>

                    <div className="compare-card-selector">
                        <div className="compare-card-label label-b">
                            <span>●</span> Dataset B (Comparison)
                        </div>
                        <select
                            className="compare-select"
                            value={datasetBId}
                            onChange={(e) => setDatasetBId(e.target.value)}
                        >
                            {Object.values(SAMPLE_DATASETS).map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.period})
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Key Metrics Comparison */}
                <section className="compare-metrics-row">
                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Total Revenue</div>
                        <div className="compare-metric-values">
                            <span className="val-a">₹{datasetA.metrics.revenue.toLocaleString()}</span>
                            <span className="val-b">₹{datasetB.metrics.revenue.toLocaleString()}</span>
                        </div>
                        <span className={`compare-delta-badge ${revenueDelta.pct > 0 ? "delta-positive" : revenueDelta.pct < 0 ? "delta-negative" : "delta-neutral"}`}>
                            {revenueDelta.pct > 0 ? "↑" : revenueDelta.pct < 0 ? "↓" : "→"} {revenueDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Units Sold</div>
                        <div className="compare-metric-values">
                            <span className="val-a">{datasetA.metrics.units}</span>
                            <span className="val-b">{datasetB.metrics.units}</span>
                        </div>
                        <span className={`compare-delta-badge ${unitsDelta.pct > 0 ? "delta-positive" : unitsDelta.pct < 0 ? "delta-negative" : "delta-neutral"}`}>
                            {unitsDelta.pct > 0 ? "↑" : unitsDelta.pct < 0 ? "↓" : "→"} {unitsDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Average Order Value</div>
                        <div className="compare-metric-values">
                            <span className="val-a">₹{datasetA.metrics.avgOrder}</span>
                            <span className="val-b">₹{datasetB.metrics.avgOrder}</span>
                        </div>
                        <span className={`compare-delta-badge ${avgOrderDelta.pct > 0 ? "delta-positive" : avgOrderDelta.pct < 0 ? "delta-negative" : "delta-neutral"}`}>
                            {avgOrderDelta.pct > 0 ? "↑" : avgOrderDelta.pct < 0 ? "↓" : "→"} {avgOrderDelta.text}
                        </span>
                    </div>

                    <div className="compare-metric-box">
                        <div className="compare-metric-title">Active Reach / Users</div>
                        <div className="compare-metric-values">
                            <span className="val-a">{datasetA.metrics.activeUsers}</span>
                            <span className="val-b">{datasetB.metrics.activeUsers}</span>
                        </div>
                        <span className={`compare-delta-badge ${usersDelta.pct > 0 ? "delta-positive" : usersDelta.pct < 0 ? "delta-negative" : "delta-neutral"}`}>
                            {usersDelta.pct > 0 ? "↑" : usersDelta.pct < 0 ? "↓" : "→"} {usersDelta.text}
                        </span>
                    </div>
                </section>

                {/* Comparative Chart */}
                <section className="compare-chart-panel">
                    <div className="compare-chart-header">
                        <h3>Comparative Revenue Distribution</h3>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Grouped Period Progression</span>
                    </div>
                    <div className="compare-chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* AI Insights & Differences */}
                <section className="compare-insights-panel">
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>Comparative Insights</h3>
                    <div className="compare-insights-grid">
                        <div className="compare-insight-card highlight">
                            <div className="compare-insight-icon">🚀</div>
                            <div className="compare-insight-text">
                                <h4>Growth Trajectory</h4>
                                <p>
                                    {datasetB.name} demonstrated a <strong>{revenueDelta.text}</strong> variance in revenue compared to {datasetA.name}.
                                </p>
                            </div>
                        </div>

                        <div className="compare-insight-card">
                            <div className="compare-insight-icon">🎯</div>
                            <div className="compare-insight-text">
                                <h4>Conversion & Volume</h4>
                                <p>
                                    Volume changed by <strong>{unitsDelta.text}</strong> units with an average ticket change of <strong>{avgOrderDelta.text}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="compare-insight-card">
                            <div className="compare-insight-icon">📊</div>
                            <div className="compare-insight-text">
                                <h4>Audience Expansion</h4>
                                <p>
                                    Active audience size tracked at <strong>{datasetB.metrics.activeUsers.toLocaleString()}</strong> ({usersDelta.text} relative to baseline).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
