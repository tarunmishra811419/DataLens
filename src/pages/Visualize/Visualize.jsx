import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
} from "chart.js";
import {
    Bar,
    Line,
    Pie,
    Doughnut,
    Scatter,
    PolarArea,
    Radar,
} from "react-chartjs-2";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import "./Visualize.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale
);

// ── Palette ──────────────────────────────────────────────────────────────────
const PALETTES = {
    vivid: {
        label: "Vivid",
        colors: [
            "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
            "#8b5cf6","#ec4899","#14b8a6","#f97316","#a3e635",
        ],
    },
    ocean: {
        label: "Ocean",
        colors: [
            "#0ea5e9","#06b6d4","#0891b2","#0e7490","#164e63",
            "#38bdf8","#7dd3fc","#bae6fd","#e0f2fe","#f0f9ff",
        ],
    },
    sunset: {
        label: "Sunset",
        colors: [
            "#f43f5e","#fb7185","#f97316","#fb923c","#fbbf24",
            "#fde047","#a3e635","#86efac","#6ee7b7","#99f6e4",
        ],
    },
    forest: {
        label: "Forest",
        colors: [
            "#16a34a","#22c55e","#4ade80","#86efac","#bbf7d0",
            "#65a30d","#84cc16","#bef264","#d9f99d","#15803d",
        ],
    },
    mono: {
        label: "Monochrome",
        colors: [
            "#f8fafc","#e2e8f0","#cbd5e1","#94a3b8","#64748b",
            "#475569","#334155","#1e293b","#0f172a","#020617",
        ],
    },
};

// ── Chart Types ───────────────────────────────────────────────────────────────
const CHART_TYPES = [
    { id: "bar",      label: "Bar",        icon: "▐▐▐", desc: "Compare values across categories" },
    { id: "line",     label: "Line",       icon: "〜",   desc: "Show trends over time" },
    { id: "pie",      label: "Pie",        icon: "◕",   desc: "Show part-to-whole relationships" },
    { id: "doughnut", label: "Doughnut",   icon: "⊙",   desc: "Pie with hollow center" },
    { id: "scatter",  label: "Scatter",    icon: "∷",   desc: "Explore correlation between variables" },
    { id: "area",     label: "Area",       icon: "△▲",  desc: "Filled line chart for magnitude" },
    { id: "radar",    label: "Radar",      icon: "✦",   desc: "Multi-variable comparison" },
    { id: "polar",    label: "Polar Area", icon: "◉",   desc: "Radial bar segments" },
    { id: "hbar",     label: "Horiz. Bar", icon: "▬▬",  desc: "Bar chart rotated horizontally" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function isNumericColumn(data, col) {
    const vals = data.map(r => r[col]).filter(v => v !== undefined && String(v).trim() !== "");
    return vals.length > 0 && vals.every(v => !isNaN(Number(v)));
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function buildChartData(chartType, data, columns, xAxis, yAxes, palette, chartTitle) {
    const colors = PALETTES[palette]?.colors ?? PALETTES.vivid.colors;

    if (chartType === "scatter") {
        // x = first yAxes[0], y = yAxes[1]
        const xCol = yAxes[0] || columns[0];
        const yCol = yAxes[1] || columns[1];
        return {
            datasets: [{
                label: `${xCol} vs ${yCol}`,
                data: data.map(r => ({ x: Number(r[xCol]) || 0, y: Number(r[yCol]) || 0 })),
                backgroundColor: hexToRgba(colors[0], 0.75),
                borderColor: colors[0],
                pointRadius: 6,
                pointHoverRadius: 9,
            }],
        };
    }

    const labels = data.map(r => String(r[xAxis] ?? ""));

    if (chartType === "pie" || chartType === "doughnut" || chartType === "polar") {
        const col = yAxes[0] || columns.find(c => isNumericColumn(data, c)) || columns[0];
        return {
            labels,
            datasets: [{
                label: col,
                data: data.map(r => Number(r[col]) || 0),
                backgroundColor: data.map((_, i) => hexToRgba(colors[i % colors.length], 0.85)),
                borderColor: data.map((_, i) => colors[i % colors.length]),
                borderWidth: 2,
            }],
        };
    }

    if (chartType === "radar") {
        const col = yAxes[0] || columns.find(c => isNumericColumn(data, c)) || columns[0];
        return {
            labels,
            datasets: [{
                label: col,
                data: data.map(r => Number(r[col]) || 0),
                backgroundColor: hexToRgba(colors[0], 0.25),
                borderColor: colors[0],
                borderWidth: 2,
                pointBackgroundColor: colors[0],
            }],
        };
    }

    // bar / hbar / line / area
    const datasets = yAxes.map((col, idx) => {
        const color = colors[idx % colors.length];
        const isArea = chartType === "area";
        return {
            label: col,
            data: data.map(r => Number(r[col]) || 0),
            backgroundColor: isArea ? hexToRgba(color, 0.25) : hexToRgba(color, 0.82),
            borderColor: color,
            borderWidth: chartType === "bar" || chartType === "hbar" ? 0 : 2.5,
            borderRadius: chartType === "bar" || chartType === "hbar" ? 6 : 0,
            fill: isArea ? "origin" : false,
            tension: chartType === "line" || chartType === "area" ? 0.4 : 0,
            pointRadius: chartType === "line" || chartType === "area" ? 4 : 0,
            pointHoverRadius: 7,
            hoverBackgroundColor: hexToRgba(color, 1),
        };
    });

    return { labels, datasets };
}

function buildChartOptions(chartType, chartTitle, showGrid, showLegend, showValues) {
    const isHorizontal = chartType === "hbar";
    const isPolar = chartType === "pie" || chartType === "doughnut" || chartType === "polar" || chartType === "radar";

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: "easeInOutQuart" },
        plugins: {
            legend: {
                display: showLegend,
                position: "top",
                labels: {
                    color: "#94a3b8",
                    padding: 16,
                    font: { size: 12, family: "Inter" },
                    usePointStyle: true,
                },
            },
            title: {
                display: !!chartTitle,
                text: chartTitle,
                color: "#f1f5f9",
                font: { size: 16, weight: "600", family: "Outfit" },
                padding: { bottom: 16 },
            },
            tooltip: {
                backgroundColor: "rgba(15,23,42,0.95)",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
                borderColor: "rgba(99,102,241,0.4)",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    if (isPolar) return baseOptions;

    return {
        ...baseOptions,
        indexAxis: isHorizontal ? "y" : "x",
        scales: {
            x: {
                display: true,
                grid: {
                    display: showGrid && !isHorizontal,
                    color: "rgba(148,163,184,0.08)",
                },
                ticks: { color: "#64748b", font: { size: 11, family: "Inter" } },
            },
            y: {
                display: true,
                grid: {
                    display: showGrid && isHorizontal ? false : showGrid,
                    color: "rgba(148,163,184,0.08)",
                },
                ticks: { color: "#64748b", font: { size: 11, family: "Inter" } },
            },
        },
    };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Visualize() {
    const location = useLocation();
    const navigate = useNavigate();
    const chartRef = useRef(null);

    const rawData = location.state?.manualData || location.state?.data || [];
    const rawColumns = location.state?.manualColumns || location.state?.columns || [];
    const datasetName = location.state?.datasetName || "Dataset";

    const [data] = useState(rawData);
    const [columns] = useState(rawColumns);

    // Config
    const [chartType, setChartType] = useState("bar");
    const [xAxis, setXAxis] = useState(columns[0] || "");
    const [yAxes, setYAxes] = useState(() => {
        const nums = columns.filter(c => isNumericColumn(rawData, c));
        return nums.length > 0 ? [nums[0]] : [columns[1] || columns[0] || ""];
    });
    const [palette, setPalette] = useState("vivid");
    const [chartTitle, setChartTitle] = useState(datasetName);
    const [showGrid, setShowGrid] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [activeTab, setActiveTab] = useState("type"); // type | axes | style
    const [downloadFmt, setDownloadFmt] = useState("png");
    const [isDownloading, setIsDownloading] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const numericCols = columns.filter(c => isNumericColumn(data, c));
    const allCols = columns;

    // Derived chart data
    const safeYAxes = yAxes.filter(Boolean);
    const chartData = rawData.length > 0
        ? buildChartData(chartType, data, columns, xAxis, safeYAxes, palette, chartTitle)
        : { labels: [], datasets: [] };
    const chartOptions = buildChartOptions(chartType, chartTitle, showGrid, showLegend, false);

    // Sync x/y when switching chart types
    useEffect(() => {
        if (chartType === "scatter") {
            setYAxes(numericCols.slice(0, 2));
        } else if (chartType === "pie" || chartType === "doughnut" || chartType === "polar" || chartType === "radar") {
            if (safeYAxes.length > 1) setYAxes([safeYAxes[0]]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartType]);

    const toggleYAxis = (col) => {
        const isScatterOrSingle = ["scatter","pie","doughnut","polar","radar"].includes(chartType);
        if (isScatterOrSingle && chartType === "scatter" && yAxes.length >= 2 && !yAxes.includes(col)) return;
        if (["pie","doughnut","polar","radar"].includes(chartType)) {
            setYAxes([col]);
            return;
        }
        setYAxes(prev =>
            prev.includes(col) ? (prev.length > 1 ? prev.filter(c => c !== col) : prev) : [...prev, col]
        );
    };

    // ── Download ─────────────────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        if (!chartRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: "#0f172a",
                scale: 2,
                useCORS: true,
            });

            const filename = `${datasetName.replace(/[^a-z0-9]/gi, "_")}_${chartType}`;

            if (downloadFmt === "png") {
                canvas.toBlob(blob => {
                    if (blob) saveAs(blob, `${filename}.png`);
                }, "image/png");
            } else if (downloadFmt === "jpg") {
                canvas.toBlob(blob => {
                    if (blob) saveAs(blob, `${filename}.jpg`);
                }, "image/jpeg", 0.92);
            } else if (downloadFmt === "svg") {
                // SVG fallback — export as PNG with message
                canvas.toBlob(blob => {
                    if (blob) saveAs(blob, `${filename}.png`);
                }, "image/png");
                setToastMsg("SVG export saved as PNG (browser limitation)");
                setTimeout(() => setToastMsg(""), 3000);
                setIsDownloading(false);
                return;
            } else if (downloadFmt === "pdf") {
                const { jsPDF } = await import("jspdf");
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
                pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
                pdf.save(`${filename}.pdf`);
            }

            setToastMsg(`Chart downloaded as ${downloadFmt.toUpperCase()}! ✓`);
            setTimeout(() => setToastMsg(""), 3000);
        } catch (err) {
            console.error(err);
            setToastMsg("Download failed. Please try again.");
            setTimeout(() => setToastMsg(""), 3000);
        }
        setIsDownloading(false);
    }, [chartRef, chartType, datasetName, downloadFmt]);

    // ── Chart renderer ────────────────────────────────────────────────────────
    const ChartComponent = {
        bar: Bar, hbar: Bar, line: Line, area: Line,
        pie: Pie, doughnut: Doughnut, scatter: Scatter,
        polar: PolarArea, radar: Radar,
    }[chartType] || Bar;

    if (rawData.length === 0) {
        return (
            <div className="viz-page">
                <div className="viz-empty">
                    <div className="viz-empty-icon">📊</div>
                    <h1>No Data to Visualize</h1>
                    <p>Go back and enter some data or upload a dataset first.</p>
                    <div className="viz-empty-btns">
                        <button className="viz-btn-primary" onClick={() => navigate("/dataset/manual")}>
                            ← Enter Data Manually
                        </button>
                        <button className="viz-btn-secondary" onClick={() => navigate("/dataset/upload")}>
                            Upload Dataset
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="viz-page">
            {/* Toast */}
            {toastMsg && <div className="viz-toast">{toastMsg}</div>}

            {/* ── Top Bar ── */}
            <header className="viz-topbar">
                <div className="viz-topbar-left">
                    <button className="viz-back-btn" onClick={() => navigate(-1)}>← Back</button>
                    <div className="viz-topbar-info">
                        <span className="viz-badge">📊 Visualization Studio</span>
                        <h1 className="viz-title">{datasetName}</h1>
                        <span className="viz-meta">{data.length} rows · {columns.length} columns</span>
                    </div>
                </div>

                <div className="viz-topbar-right">
                    <select
                        className="viz-fmt-select"
                        value={downloadFmt}
                        onChange={e => setDownloadFmt(e.target.value)}
                    >
                        <option value="png">PNG</option>
                        <option value="jpg">JPEG</option>
                        <option value="pdf">PDF</option>
                        <option value="svg">SVG</option>
                    </select>
                    <button
                        className="viz-download-btn"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? "⟳ Exporting…" : "⤓ Download Chart"}
                    </button>
                </div>
            </header>

            {/* ── Main Layout ── */}
            <div className="viz-layout">

                {/* ── Left Panel: Controls ── */}
                <aside className="viz-panel">
                    {/* Tabs */}
                    <div className="viz-panel-tabs">
                        {[
                            { id: "type",  label: "Chart Type" },
                            { id: "axes",  label: "Axes & Data" },
                            { id: "style", label: "Style" },
                        ].map(t => (
                            <button
                                key={t.id}
                                className={`viz-tab-btn ${activeTab === t.id ? "active" : ""}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab: Chart Type ── */}
                    {activeTab === "type" && (
                        <div className="viz-tab-content">
                            <p className="viz-panel-hint">Select the chart type that best represents your data</p>
                            <div className="viz-chart-type-grid">
                                {CHART_TYPES.map(ct => (
                                    <button
                                        key={ct.id}
                                        className={`viz-type-card ${chartType === ct.id ? "selected" : ""}`}
                                        onClick={() => setChartType(ct.id)}
                                        title={ct.desc}
                                    >
                                        <span className="viz-type-icon">{ct.icon}</span>
                                        <span className="viz-type-label">{ct.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="viz-type-desc">
                                {CHART_TYPES.find(c => c.id === chartType)?.desc}
                            </div>
                        </div>
                    )}

                    {/* ── Tab: Axes & Data ── */}
                    {activeTab === "axes" && (
                        <div className="viz-tab-content">
                            {/* X Axis */}
                            {!["pie","doughnut","polar","radar"].includes(chartType) && chartType !== "scatter" && (
                                <div className="viz-control-group">
                                    <label className="viz-label">
                                        {chartType === "hbar" ? "Y Axis (Labels)" : "X Axis (Labels)"}
                                    </label>
                                    <select
                                        className="viz-select"
                                        value={xAxis}
                                        onChange={e => setXAxis(e.target.value)}
                                    >
                                        {allCols.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Y Axes / Values */}
                            <div className="viz-control-group">
                                <label className="viz-label">
                                    {chartType === "scatter"
                                        ? "X & Y Variables (pick 2)"
                                        : ["pie","doughnut","polar","radar"].includes(chartType)
                                            ? "Value Column"
                                            : "Value Columns (multi-select)"}
                                </label>
                                <div className="viz-col-list">
                                    {(chartType === "scatter" ? allCols : numericCols.length > 0 ? numericCols : allCols).map(col => (
                                        <button
                                            key={col}
                                            className={`viz-col-chip ${yAxes.includes(col) ? "selected" : ""}`}
                                            onClick={() => toggleYAxis(col)}
                                        >
                                            <span className="viz-col-dot"></span>
                                            {col}
                                            {isNumericColumn(data, col) && <span className="viz-col-num-badge">123</span>}
                                        </button>
                                    ))}
                                </div>
                                {chartType === "scatter" && (
                                    <p className="viz-panel-hint" style={{marginTop: 8}}>
                                        First selected = X axis · Second selected = Y axis
                                    </p>
                                )}
                            </div>

                            {/* Chart Title */}
                            <div className="viz-control-group">
                                <label className="viz-label">Chart Title</label>
                                <input
                                    className="viz-input"
                                    type="text"
                                    value={chartTitle}
                                    onChange={e => setChartTitle(e.target.value)}
                                    placeholder="Enter chart title…"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Tab: Style ── */}
                    {activeTab === "style" && (
                        <div className="viz-tab-content">
                            {/* Color Palette */}
                            <div className="viz-control-group">
                                <label className="viz-label">Color Palette</label>
                                <div className="viz-palette-grid">
                                    {Object.entries(PALETTES).map(([key, pal]) => (
                                        <button
                                            key={key}
                                            className={`viz-palette-card ${palette === key ? "selected" : ""}`}
                                            onClick={() => setPalette(key)}
                                            title={pal.label}
                                        >
                                            <div className="viz-palette-swatches">
                                                {pal.colors.slice(0, 5).map((c, i) => (
                                                    <span key={i} style={{ background: c }} className="viz-swatch" />
                                                ))}
                                            </div>
                                            <span className="viz-palette-name">{pal.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toggle options */}
                            <div className="viz-control-group">
                                <label className="viz-label">Display Options</label>
                                <div className="viz-toggles">
                                    <label className="viz-toggle-row">
                                        <span>Show Grid Lines</span>
                                        <div
                                            className={`viz-toggle ${showGrid ? "on" : ""}`}
                                            onClick={() => setShowGrid(v => !v)}
                                        />
                                    </label>
                                    <label className="viz-toggle-row">
                                        <span>Show Legend</span>
                                        <div
                                            className={`viz-toggle ${showLegend ? "on" : ""}`}
                                            onClick={() => setShowLegend(v => !v)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick stats strip */}
                    <div className="viz-panel-footer">
                        <div className="viz-stat"><strong>{data.length}</strong> rows</div>
                        <div className="viz-stat"><strong>{numericCols.length}</strong> numeric</div>
                        <div className="viz-stat"><strong>{safeYAxes.length}</strong> series</div>
                    </div>
                </aside>

                {/* ── Right: Chart Canvas ── */}
                <main className="viz-canvas-area">
                    {/* Chart type quick-switcher pills */}
                    <div className="viz-quick-types">
                        {CHART_TYPES.map(ct => (
                            <button
                                key={ct.id}
                                className={`viz-quick-pill ${chartType === ct.id ? "active" : ""}`}
                                onClick={() => setChartType(ct.id)}
                                title={ct.desc}
                            >
                                <span>{ct.icon}</span> {ct.label}
                            </button>
                        ))}
                    </div>

                    {/* Chart render area */}
                    <div className="viz-chart-wrapper" ref={chartRef}>
                        <div className="viz-chart-inner">
                            <ChartComponent
                                data={chartData}
                                options={chartOptions}
                            />
                        </div>
                    </div>

                    {/* Data summary table below chart */}
                    <div className="viz-data-table-section">
                        <div className="viz-data-table-header">
                            <span className="viz-data-table-title">📋 Dataset Preview</span>
                            <span className="viz-data-table-sub">Showing first {Math.min(data.length, 6)} of {data.length} rows</span>
                        </div>
                        <div className="viz-data-table-scroll">
                            <table className="viz-data-table">
                                <thead>
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col} className={yAxes.includes(col) ? "viz-col-active" : ""}>
                                                {col}
                                                {yAxes.includes(col) && <span className="viz-th-badge">●</span>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 6).map((row, i) => (
                                        <tr key={i}>
                                            {columns.map(col => (
                                                <td key={col} className={yAxes.includes(col) ? "viz-col-active" : ""}>
                                                    {row[col] ?? "—"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
