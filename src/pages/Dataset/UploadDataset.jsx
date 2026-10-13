import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./UploadDataset.css";

// ── File type helpers ─────────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
    ".csv":  { label: "CSV",   color: "#10b981" },
    ".tsv":  { label: "TSV",   color: "#10b981" },
    ".txt":  { label: "TXT",   color: "#64748b" },
    ".xlsx": { label: "Excel", color: "#2563eb" },
    ".xls":  { label: "Excel", color: "#2563eb" },
    ".json": { label: "JSON",  color: "#f59e0b" },
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
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    if (json.length === 0) throw new Error("The selected Excel sheet contains no data.");
    const cols = Object.keys(json[0]);
    return { rows: json, columns: cols };
}

function parseJSON(text) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("JSON file must contain an array of objects with data records.");
    }
    const cols = Object.keys(parsed[0]);
    return { rows: parsed, columns: cols };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadDataset() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState("");

    // ── File processing core ──────────────────────────────────────────────────
    const processFile = useCallback(async (selectedFile) => {
        if (!selectedFile) return;
        setError("");
        setFile(selectedFile);
        setParsedData(null);
        setParsing(true);

        const ext = getExtension(selectedFile.name);

        try {
            let result;

            if (ext === ".csv") {
                const text = await selectedFile.text();
                result = await parseCSV(text, ",");
            } else if (ext === ".tsv" || ext === ".txt") {
                const text = await selectedFile.text();
                const sep = text.includes("\t") ? "\t" : ",";
                result = await parseCSV(text, sep);
            } else if (ext === ".xlsx" || ext === ".xls") {
                const buffer = await selectedFile.arrayBuffer();
                result = parseExcel(buffer);
            } else if (ext === ".json") {
                const text = await selectedFile.text();
                result = parseJSON(text);
            } else {
                throw new Error(
                    `Unsupported file format "${ext}". Supported extensions: .csv, .tsv, .txt, .xlsx, .xls, .json`
                );
            }

            if (!result.rows || result.rows.length === 0) {
                throw new Error("The uploaded file appears to be empty or has no data rows.");
            }

            setParsedData(result);
        } catch (err) {
            setError(err.message || "An unexpected error occurred while parsing the file.");
            setFile(null);
            setParsedData(null);
        } finally {
            setParsing(false);
        }
    }, []);

    // ── Drag & drop handlers ──────────────────────────────────────────────────
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    const resetFile = () => {
        setFile(null);
        setParsedData(null);
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Navigation actions ────────────────────────────────────────────────────
    const handleVisualize = () => {
        if (!parsedData) return;
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        navigate("/visualize", {
            state: {
                manualData: parsedData.rows,
                manualColumns: parsedData.columns,
                manualRowLabels: parsedData.rows.map((_, i) => `Row ${i + 1}`),
                datasetName: cleanName,
            },
        });
    };

    const handlePreview = () => {
        if (!parsedData) return;
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        navigate("/dataset/preview", {
            state: {
                manualData: parsedData.rows,
                manualColumns: parsedData.columns,
                datasetName: cleanName,
            },
        });
    };

    const ext = file ? getExtension(file.name) : "";
    const fileInfo = ACCEPTED_TYPES[ext] || { label: "FILE", color: "#64748b" };

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
                        <div className="upload-badge">Data Import Studio</div>
                        <h1>Upload Your Dataset</h1>
                        <p>
                            Drag & drop or browse to import your data - supports <strong>CSV, Excel (.xlsx/.xls), JSON</strong> and <strong>TSV</strong>.
                            DataLens parses your files locally and provides immediate chart visualization.
                        </p>
                    </div>
                </header>

                {/* ── Supported Formats Strip ── */}
                <div className="upload-formats-strip">
                    {Object.entries(ACCEPTED_TYPES).map(([extStr, info]) => (
                        <div key={extStr} className="upload-format-chip" style={{ "--chip-color": info.color }}>
                            {info.label} <code>{extStr}</code>
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
                                <p>Release to upload</p>
                            </div>
                        ) : (
                            <div className="upload-idle-state">
                                <div className="upload-icon-wrap">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
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
                                <span style={{ fontSize: "11px", fontWeight: 700 }}>{fileInfo?.label}</span>
                            </div>
                            <div className="upload-file-details">
                                <strong>{file.name}</strong>
                                <div className="upload-file-meta">
                                    <span className="upload-tag" style={{ background: fileInfo?.color + "22", color: fileInfo?.color }}>
                                        {fileInfo?.label}
                                    </span>
                                    <span>{formatBytes(file.size)}</span>
                                    <span>{parsedData.rows.length} rows parsed</span>
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
                                <span>Data Preview</span>
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
                                                        {row[col] ?? "-"}
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
                                Dataset successfully parsed. Select your next step:
                            </div>
                            <div className="upload-action-btns">
                                <button className="upload-visualize-btn" onClick={handleVisualize}>
                                    Visualize Data
                                    <span>→ Charts & Graphs</span>
                                </button>
                                <button className="upload-preview-btn" onClick={handlePreview}>
                                    Preview & Statistics
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