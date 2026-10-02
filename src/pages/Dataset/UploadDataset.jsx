import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./UploadDataset.css";

// ── File type helpers ─────────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
    ".csv":  { label: "CSV",   icon: "📄", color: "#10b981" },
    ".tsv":  { label: "TSV",   icon: "📄", color: "#10b981" },
    ".txt":  { label: "TXT",   icon: "📝", color: "#64748b" },
    ".xlsx": { label: "Excel", icon: "📊", color: "#16a34a" },
    ".xls":  { label: "Excel", icon: "📊", color: "#16a34a" },
    ".json": { label: "JSON",  icon: "🔧", color: "#f59e0b" },
};

function getExtension(filename) {
    return ("." + filename.split(".").pop()).toLowerCase();
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseCSV(text, separator = ",") {
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: separator,
            complete: (results) => {
                if (results.errors.length > 0 && results.data.length === 0) {
                    reject(new Error("Failed to parse CSV: " + results.errors[0].message));
                } else {
                    const cols = results.meta.fields || [];
                    resolve({ rows: results.data, columns: cols });
                }
            },
            error: (err) => reject(new Error(err.message)),
        });
    });
}

function parseExcel(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
    // Convert all values to strings for consistency
    const rows = jsonData.map(row => {
        const r = {};
        columns.forEach(col => { r[col] = String(row[col] ?? ""); });
        return r;
    });
    return { rows, columns };
}

function parseJSON(text) {
    const parsed = JSON.parse(text);
    let arr;
    if (Array.isArray(parsed)) {
        arr = parsed;
    } else if (parsed && typeof parsed === "object") {
        // Try to find an array property
        const arrays = Object.values(parsed).filter(v => Array.isArray(v));
        if (arrays.length > 0) arr = arrays[0];
        else arr = [parsed];
    } else {
        throw new Error("JSON must contain an array of objects.");
    }
    if (arr.length === 0) return { rows: [], columns: [] };
    const columns = [...new Set(arr.flatMap(o => Object.keys(o)))];
    const rows = arr.map(obj => {
        const r = {};
        columns.forEach(col => { r[col] = String(obj[col] ?? ""); });
        return r;
    });
    return { rows, columns };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadDataset() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [fileInfo, setFileInfo] = useState(null); // { ext, label, icon, color }
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState("");
    const [parsedData, setParsedData] = useState(null); // { rows, columns }

    // ── Process file ──────────────────────────────────────────────────────────
    const processFile = useCallback(async (selectedFile) => {
        setError("");
        setParsedData(null);
        setFile(selectedFile);

        const ext = getExtension(selectedFile.name);
        const info = ACCEPTED_TYPES[ext];

        if (!info) {
            setError(`Unsupported file type "${ext}". Please upload CSV, Excel, JSON, or TSV.`);
            setFile(null);
            return;
        }

        setFileInfo(info);
        setParsing(true);

        try {
            let result;

            if (ext === ".xlsx" || ext === ".xls") {
                const buffer = await selectedFile.arrayBuffer();
                result = parseExcel(buffer);
            } else if (ext === ".json") {
                const text = await selectedFile.text();
                result = parseJSON(text);
            } else if (ext === ".tsv") {
                const text = await selectedFile.text();
                result = await parseCSV(text, "\t");
            } else {
                // CSV / TXT
                const text = await selectedFile.text();
                result = await parseCSV(text, ",");
            }

            if (!result.rows || result.rows.length === 0) {
                setError("The file appears to be empty or has no data rows.");
                setFile(null);
                setParsedData(null);
            } else {
                setParsedData(result);
            }
        } catch (err) {
            setError("Could not parse the file: " + (err.message || "Unknown error."));
            setFile(null);
            setParsedData(null);
        } finally {
            setParsing(false);
        }
    }, []);

    // ── Input change ─────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) processFile(f);
    };

    // ── Drag & Drop ──────────────────────────────────────────────────────────
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) processFile(f);
    };

    // ── Navigate actions ─────────────────────────────────────────────────────
    const handleVisualize = () => {
        if (!parsedData) return;
        navigate("/visualize", {
            state: {
                manualData: parsedData.rows,
                manualColumns: parsedData.columns,
                datasetName: file.name.replace(/\.[^/.]+$/, ""),
            },
        });
    };

    const handlePreview = () => {
        if (!parsedData) return;
        navigate("/dataset/preview", {
            state: {
                manualData: parsedData.rows,
                manualColumns: parsedData.columns,
                datasetName: file.name.replace(/\.[^/.]+$/, ""),
            },
        });
    };

    const resetFile = () => {
        setFile(null);
        setFileInfo(null);
        setParsedData(null);
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Derived ──────────────────────────────────────────────────────────────
    const numericCols = parsedData
        ? parsedData.columns.filter(col => {
            const vals = parsedData.rows.map(r => r[col]).filter(v => v !== "" && v !== undefined);
            return vals.length > 0 && vals.every(v => !isNaN(Number(v)));
          })
        : [];

    return (
        <div className="upload-page">
            <div className="upload-container">

                {/* ── Header ── */}
                <header className="upload-header">
                    <button className="upload-back-btn" onClick={() => navigate("/dataset/create")}>
                        ← Back
                    </button>
                    <div className="upload-header-text">
                        <div className="upload-badge">⬆ Data Import Studio</div>
                        <h1>Upload Your Dataset</h1>
                        <p>
                            Drag & drop or browse to import your data — supports <strong>CSV, Excel (.xlsx/.xls), JSON</strong> and <strong>TSV</strong>.
                            DataLens will parse it instantly and take you straight to the chart builder.
                        </p>
                    </div>
                </header>

                {/* ── Supported Formats Strip ── */}
                <div className="upload-formats-strip">
                    {Object.entries(ACCEPTED_TYPES).map(([ext, info]) => (
                        <div key={ext} className="upload-format-chip" style={{ "--chip-color": info.color }}>
                            <span>{info.icon}</span> {info.label} <code>{ext}</code>
                        </div>
                    ))}
                </div>

                {/* ── Drop Zone ── */}
                {!parsedData && (
                    <div
                        ref={dropRef}
                        className={`upload-dropzone ${isDragging ? "dragging" : ""} ${parsing ? "parsing" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !parsing && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.tsv,.txt,.xlsx,.xls,.json"
                            onChange={handleFileChange}
                            hidden
                        />

                        {parsing ? (
                            <div className="upload-parsing-state">
                                <div className="upload-spinner"></div>
                                <p>Parsing <strong>{file?.name}</strong>…</p>
                                <span>Reading rows and detecting column types</span>
                            </div>
                        ) : isDragging ? (
                            <div className="upload-drag-state">
                                <div className="upload-drop-icon">⬇</div>
                                <p>Release to upload</p>
                            </div>
                        ) : (
                            <div className="upload-idle-state">
                                <div className="upload-icon-wrap">
                                    <span className="upload-big-icon">⬆</span>
                                </div>
                                <h2>Drop your file here</h2>
                                <p>or <span className="upload-browse-link">click to browse</span> your computer</p>
                                <div className="upload-hint-chips">
                                    <span>CSV</span><span>Excel</span><span>JSON</span><span>TSV</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Error Banner ── */}
                {error && (
                    <div className="upload-error-banner">
                        <span className="upload-error-icon">⚠</span>
                        <div>
                            <strong>Upload Error</strong>
                            <p>{error}</p>
                        </div>
                        <button className="upload-error-dismiss" onClick={() => setError("")}>×</button>
                    </div>
                )}

                {/* ── Parsed Success Card ── */}
                {parsedData && file && (
                    <div className="upload-success-section">

                        {/* File Info Bar */}
                        <div className="upload-file-bar">
                            <div className="upload-file-icon" style={{ background: fileInfo?.color + "22", borderColor: fileInfo?.color + "55" }}>
                                <span>{fileInfo?.icon}</span>
                            </div>
                            <div className="upload-file-details">
                                <strong>{file.name}</strong>
                                <div className="upload-file-meta">
                                    <span className="upload-tag" style={{ background: fileInfo?.color + "22", color: fileInfo?.color }}>
                                        {fileInfo?.label}
                                    </span>
                                    <span>{formatBytes(file.size)}</span>
                                    <span>✓ {parsedData.rows.length} rows parsed</span>
                                    <span>{parsedData.columns.length} columns</span>
                                    {numericCols.length > 0 && (
                                        <span>{numericCols.length} numeric</span>
                                    )}
                                </div>
                            </div>
                            <button className="upload-reset-btn" onClick={resetFile} title="Remove and upload a different file">
                                ✕ Remove
                            </button>
                        </div>

                        {/* Column Summary */}
                        <div className="upload-col-summary">
                            <span className="upload-col-label">Detected Columns:</span>
                            <div className="upload-col-chips">
                                {parsedData.columns.map(col => (
                                    <span
                                        key={col}
                                        className={`upload-col-chip ${numericCols.includes(col) ? "numeric" : "text"}`}
                                        title={numericCols.includes(col) ? "Numeric column" : "Text column"}
                                    >
                                        <span className="upload-col-type-dot"></span>
                                        {col}
                                        <span className="upload-col-type-badge">
                                            {numericCols.includes(col) ? "123" : "Aa"}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Data Preview Table */}
                        <div className="upload-preview-card">
                            <div className="upload-preview-header">
                                <span>📋 Data Preview</span>
                                <span className="upload-preview-sub">
                                    Showing first {Math.min(parsedData.rows.length, 8)} of {parsedData.rows.length} rows
                                </span>
                            </div>
                            <div className="upload-preview-scroll">
                                <table className="upload-preview-table">
                                    <thead>
                                        <tr>
                                            <th className="upload-row-num">#</th>
                                            {parsedData.columns.map(col => (
                                                <th key={col} className={numericCols.includes(col) ? "col-numeric" : ""}>
                                                    {col}
                                                    {numericCols.includes(col) && <span className="upload-num-badge">123</span>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.rows.slice(0, 8).map((row, i) => (
                                            <tr key={i}>
                                                <td className="upload-row-num">{i + 1}</td>
                                                {parsedData.columns.map(col => (
                                                    <td key={col} className={numericCols.includes(col) ? "col-numeric" : ""}>
                                                        {row[col] ?? "—"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="upload-action-bar">
                            <div className="upload-action-hint">
                                🎉 Your data is ready! Choose what you'd like to do next:
                            </div>
                            <div className="upload-action-btns">
                                <button className="upload-visualize-btn" onClick={handleVisualize}>
                                    📊 Visualize Data
                                    <span>→ Charts & Graphs</span>
                                </button>
                                <button className="upload-preview-btn" onClick={handlePreview}>
                                    🔍 Preview & Stats
                                    <span>→ Data Quality</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}