import { useState, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ManualDataset.css";

// Helper to build default row labels for a given count
const buildDefaultLabels = (count, startIndex = 0) =>
    Array.from({ length: count }, (_, i) => `Row ${startIndex + i + 1}`);

// Helper to build a blank dataset of n cols and m rows
const buildBlankDataset = (numCols = 3, numRows = 5) => {
    const cols = Array.from({ length: numCols }, (_, i) => `Column ${i + 1}`);
    const rows = Array.from({ length: numRows }, () => {
        const row = {};
        cols.forEach(c => { row[c] = ""; });
        return row;
    });
    const labels = buildDefaultLabels(numRows);
    return { cols, rows, labels };
};

// Pre-configured rich sample templates for 1-click test drive
const TEMPLATES = {
    sales: {
        name: "Monthly Sales Performance",
        category: "Sales",
        columns: ["Month", "Region", "Revenue ($)", "Units Sold", "Customer Rating"],
        rows: [
            { "Month": "January", "Region": "North", "Revenue ($)": "45200", "Units Sold": "320", "Customer Rating": "4.8" },
            { "Month": "February", "Region": "South", "Revenue ($)": "38900", "Units Sold": "285", "Customer Rating": "4.6" },
            { "Month": "March", "Region": "East", "Revenue ($)": "52400", "Units Sold": "410", "Customer Rating": "4.9" },
            { "Month": "April", "Region": "West", "Revenue ($)": "48100", "Units Sold": "360", "Customer Rating": "4.7" },
            { "Month": "May", "Region": "North", "Revenue ($)": "61000", "Units Sold": "490", "Customer Rating": "4.9" },
            { "Month": "June", "Region": "Central", "Revenue ($)": "55700", "Units Sold": "430", "Customer Rating": "4.8" },
        ]
    },
    inventory: {
        name: "Q3 Product Inventory",
        category: "Operations",
        columns: ["Product", "Category", "Price ($)", "Stock", "Reorder Level"],
        rows: [
            { "Product": "Wireless Headphones", "Category": "Audio", "Price ($)": "89.99", "Stock": "142", "Reorder Level": "30" },
            { "Product": "Mechanical Keyboard", "Category": "Accessories", "Price ($)": "129.50", "Stock": "65", "Reorder Level": "25" },
            { "Product": "Ultra HD Monitor 27\"", "Category": "Displays", "Price ($)": "299.00", "Stock": "38", "Reorder Level": "15" },
            { "Product": "Ergonomic Desk Chair", "Category": "Furniture", "Price ($)": "249.99", "Stock": "24", "Reorder Level": "10" },
            { "Product": "USB-C Dual Dock", "Category": "Accessories", "Price ($)": "59.00", "Stock": "210", "Reorder Level": "50" },
        ]
    },
    analytics: {
        name: "Website Growth Analytics",
        category: "Marketing",
        columns: ["Week", "Visitors", "Page Views", "Bounce Rate (%)", "Conversions"],
        rows: [
            { "Week": "Week 1", "Visitors": "12400", "Page Views": "38900", "Bounce Rate (%)": "42.1", "Conversions": "540" },
            { "Week": "Week 2", "Visitors": "14100", "Page Views": "43200", "Bounce Rate (%)": "39.8", "Conversions": "620" },
            { "Week": "Week 3", "Visitors": "16800", "Page Views": "51500", "Bounce Rate (%)": "37.5", "Conversions": "790" },
            { "Week": "Week 4", "Visitors": "19500", "Page Views": "62100", "Bounce Rate (%)": "35.2", "Conversions": "940" },
            { "Week": "Week 5", "Visitors": "22100", "Page Views": "70400", "Bounce Rate (%)": "34.0", "Conversions": "1120" },
        ]
    },
    grades: {
        name: "Student Academic Performance",
        category: "Education",
        columns: ["Student Name", "Math", "Science", "English", "Attendance (%)"],
        rows: [
            { "Student Name": "Alex Rivera", "Math": "92", "Science": "88", "English": "95", "Attendance (%)": "98" },
            { "Student Name": "Sophia Chen", "Math": "98", "Science": "96", "English": "91", "Attendance (%)": "100" },
            { "Student Name": "Marcus Johnson", "Math": "78", "Science": "82", "English": "85", "Attendance (%)": "92" },
            { "Student Name": "Elena Rostova", "Math": "85", "Science": "90", "English": "89", "Attendance (%)": "96" },
            { "Student Name": "David Patel", "Math": "90", "Science": "94", "English": "92", "Attendance (%)": "97" },
        ]
    }
};

function ManualDataset() {
    const navigate = useNavigate();
    const uniqueFormId = useId();

    // Mode: "template" = sample data loaded, "blank" = user's own dataset
    const [mode, setMode] = useState("template");

    const [datasetName, setDatasetName] = useState("Sales Revenue Dataset");
    const [category, setCategory] = useState("General");
    const [columns, setColumns] = useState([
        "Month",
        "Region",
        "Revenue ($)",
        "Units Sold",
        "Customer Rating"
    ]);

    const [rows, setRows] = useState([
        { "Month": "January", "Region": "North", "Revenue ($)": "45200", "Units Sold": "320", "Customer Rating": "4.8" },
        { "Month": "February", "Region": "South", "Revenue ($)": "38900", "Units Sold": "285", "Customer Rating": "4.6" },
        { "Month": "March", "Region": "East", "Revenue ($)": "52400", "Units Sold": "410", "Customer Rating": "4.9" },
        { "Month": "April", "Region": "West", "Revenue ($)": "48100", "Units Sold": "360", "Customer Rating": "4.7" },
    ]);

    // Editable row labels (shown in # column)
    const [rowLabels, setRowLabels] = useState(buildDefaultLabels(4));
    const [editingLabelIdx, setEditingLabelIdx] = useState(null);
    const [labelDraft, setLabelDraft] = useState("");
    const labelInputRef = useRef(null);

    // Editable column names — draft while typing, commit on blur/Enter
    const [editingColName, setEditingColName] = useState(null); // original name
    const [colNameDraft, setColNameDraft] = useState("");

    // Modal state for clipboard paste
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [pasteRawText, setPasteRawText] = useState("");

    // Calculate real-time stats
    const totalCells = rows.length * columns.length;
    let filledCells = 0;
    rows.forEach(row => {
        columns.forEach(col => {
            if (row[col] !== undefined && String(row[col]).trim() !== "") {
                filledCells++;
            }
        });
    });
    const fillRate = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

    // Detect column type (numeric vs text)
    const getColumnTypeIcon = (column) => {
        const values = rows
            .map(r => r[column])
            .filter(v => v !== undefined && String(v).trim() !== "");

        if (values.length === 0) return "Aa";
        const allNumeric = values.every(v => !isNaN(Number(v)));
        return allNumeric ? "123" : "Aa";
    };

    // ─── Row Label Editing ───
    const startEditingLabel = (idx) => {
        setEditingLabelIdx(idx);
        setLabelDraft(rowLabels[idx]);
        setTimeout(() => labelInputRef.current?.focus(), 30);
    };

    const commitLabelEdit = () => {
        if (editingLabelIdx === null) return;
        const trimmed = labelDraft.trim();
        setRowLabels(curr => {
            const updated = [...curr];
            updated[editingLabelIdx] = trimmed || `Row ${editingLabelIdx + 1}`;
            return updated;
        });
        setEditingLabelIdx(null);
        setLabelDraft("");
    };

    const handleLabelKeyDown = (e) => {
        if (e.key === "Enter") commitLabelEdit();
        if (e.key === "Escape") {
            setEditingLabelIdx(null);
            setLabelDraft("");
        }
    };

    // Cell editing
    const handleCellChange = (rowIndex, column, value) => {
        setRows(currentRows => {
            const updated = [...currentRows];
            updated[rowIndex] = {
                ...updated[rowIndex],
                [column]: value,
            };
            return updated;
        });
    };

    // Keyboard navigation helper
    const handleKeyDown = (e, rowIndex, colIndex) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (rowIndex === rows.length - 1) {
                addRow();
            }
            setTimeout(() => {
                const nextInput = document.getElementById(`cell-${rowIndex + 1}-${colIndex}`);
                if (nextInput) nextInput.focus();
            }, 50);
        } else if (e.key === "ArrowDown") {
            const next = document.getElementById(`cell-${rowIndex + 1}-${colIndex}`);
            if (next) {
                e.preventDefault();
                next.focus();
            }
        } else if (e.key === "ArrowUp") {
            const prev = document.getElementById(`cell-${rowIndex - 1}-${colIndex}`);
            if (prev) {
                e.preventDefault();
                prev.focus();
            }
        }
    };

    // Add 1 Row
    const addRow = () => {
        const newRow = {};
        columns.forEach(col => { newRow[col] = ""; });
        setRows(currentRows => [...currentRows, newRow]);
        setRowLabels(curr => [...curr, `Row ${curr.length + 1}`]);
    };

    // Add multiple Rows
    const addMultipleRows = (count = 5) => {
        const newBatch = [];
        for (let i = 0; i < count; i++) {
            const newRow = {};
            columns.forEach(col => { newRow[col] = ""; });
            newBatch.push(newRow);
        }
        setRows(currentRows => [...currentRows, ...newBatch]);
        setRowLabels(curr => [...curr, ...buildDefaultLabels(count, curr.length)]);
    };

    // Delete single row
    const deleteRow = (rowIndex) => {
        if (rows.length === 1) {
            const empty = {};
            columns.forEach(col => { empty[col] = ""; });
            setRows([empty]);
            setRowLabels(["Row 1"]);
            return;
        }
        setRows(currentRows => currentRows.filter((_, i) => i !== rowIndex));
        setRowLabels(curr => curr.filter((_, i) => i !== rowIndex));
    };

    // Add new Column
    const addColumn = () => {
        let baseName = `Column ${columns.length + 1}`;
        let counter = 1;
        while (columns.includes(baseName)) {
            baseName = `Column ${columns.length + 1 + counter}`;
            counter++;
        }

        setColumns(curr => [...curr, baseName]);
        setRows(curr => curr.map(r => ({ ...r, [baseName]: "" })));
    };

    // Delete Column
    const deleteColumn = (colToDelete) => {
        if (columns.length <= 1) {
            alert("A dataset must have at least one column.");
            return;
        }
        setColumns(curr => curr.filter(c => c !== colToDelete));
        setRows(curr => curr.map(r => {
            const copy = { ...r };
            delete copy[colToDelete];
            return copy;
        }));
    };

    // ─── Column Name Editing (draft-based, commit on blur/Enter) ───
    const startEditingCol = (colName) => {
        setEditingColName(colName);
        setColNameDraft(colName);
    };

    const commitColRename = () => {
        const oldName = editingColName;
        if (!oldName) return;
        setEditingColName(null);
        const trimmed = colNameDraft.trim();
        if (!trimmed || trimmed === oldName) return;

        if (columns.some(c => c !== oldName && c.toLowerCase() === trimmed.toLowerCase())) {
            alert(`A column named "${trimmed}" already exists.`);
            return;
        }

        setColumns(curr => curr.map(c => (c === oldName ? trimmed : c)));
        setRows(curr => curr.map(r => {
            const updated = { ...r };
            updated[trimmed] = updated[oldName] !== undefined ? updated[oldName] : "";
            delete updated[oldName];
            return updated;
        }));
    };

    const handleColNameKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitColRename();
        }
        if (e.key === "Escape") {
            setEditingColName(null);
            setColNameDraft("");
        }
    };

    // Load pre-configured sample template
    const loadTemplate = (key) => {
        const template = TEMPLATES[key];
        if (!template) return;
        setDatasetName(template.name);
        setCategory(template.category);
        setColumns(template.columns);
        setRows(template.rows.map(r => ({ ...r })));
        setRowLabels(buildDefaultLabels(template.rows.length));
        setMode("template");
    };

    // ─── Create Your Own Dataset (blank mode) ───
    const handleCreateOwn = () => {
        if (
            rows.some(r => Object.values(r).some(v => String(v).trim() !== "")) ||
            datasetName.trim() !== "Sales Revenue Dataset"
        ) {
            if (!window.confirm("Start a blank dataset? Your current data will be cleared.")) return;
        }
        const { cols, rows: blankRows, labels } = buildBlankDataset(3, 5);
        setColumns(cols);
        setRows(blankRows);
        setRowLabels(labels);
        setDatasetName("My Custom Dataset");
        setCategory("General");
        setMode("blank");
    };

    // Reset to clean empty grid
    const handleClearAll = () => {
        if (rows.some(r => Object.values(r).some(v => String(v).trim() !== ""))) {
            if (!window.confirm("Clear all data in this table? This cannot be undone.")) {
                return;
            }
        }
        const defaultCols = ["Column 1", "Column 2", "Column 3"];
        setColumns(defaultCols);
        setRows([
            { "Column 1": "", "Column 2": "", "Column 3": "" },
            { "Column 1": "", "Column 2": "", "Column 3": "" },
            { "Column 1": "", "Column 2": "", "Column 3": "" },
        ]);
        setRowLabels(buildDefaultLabels(3));
        setDatasetName("New Manual Dataset");
    };

    // Parse and apply pasted data (TSV from Excel/Sheets or CSV)
    const handleApplyPaste = () => {
        if (!pasteRawText.trim()) {
            setShowPasteModal(false);
            return;
        }

        const lines = pasteRawText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) return;

        // Determine separator: Tab or Comma
        const firstLine = lines[0];
        const isTab = firstLine.includes("\t");
        const separator = isTab ? "\t" : ",";

        // First line as header
        const parsedHeaders = firstLine.split(separator).map((h, i) => h.trim().replace(/^["']|["']$/g, "") || `Col ${i + 1}`);

        // Ensure unique header names
        const uniqueHeaders = [];
        parsedHeaders.forEach((h, idx) => {
            let uniqueName = h;
            let counter = 1;
            while (uniqueHeaders.includes(uniqueName)) {
                uniqueName = `${h}_${counter++}`;
            }
            uniqueHeaders.push(uniqueName);
        });

        // Rows
        const parsedRows = lines.slice(1).map(line => {
            const parts = line.split(separator);
            const rowObj = {};
            uniqueHeaders.forEach((col, idx) => {
                rowObj[col] = (parts[idx] || "").trim().replace(/^["']|["']$/g, "");
            });
            return rowObj;
        });

        // If only 1 line was pasted, treat it as 1 row with generic headers
        if (parsedRows.length === 0) {
            const singleRow = {};
            uniqueHeaders.forEach((col) => { singleRow[col] = ""; });
            setColumns(uniqueHeaders);
            setRows([singleRow]);
            setRowLabels(["Row 1"]);
        } else {
            setColumns(uniqueHeaders);
            setRows(parsedRows);
            setRowLabels(buildDefaultLabels(parsedRows.length));
        }

        setPasteRawText("");
        setShowPasteModal(false);
    };

    // Download table directly as a CSV file
    const handleExportCSV = () => {
        const headerLine = ["Row Label", ...columns].map(c => `"${c.replace(/"/g, '""')}"`).join(",");
        const rowLines = rows.map((r, i) =>
            [`"${(rowLabels[i] || `Row ${i + 1}`).replace(/"/g, '""')}"`,
            ...columns.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`)].join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headerLine, ...rowLines].join("\n"));
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `${datasetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Navigate directly to visualization studio
    const handleVisualize = () => {
        const hasData = rows.some(r =>
            columns.some(col => String(r[col] ?? "").trim() !== "")
        );
        if (!hasData) {
            alert("Please enter at least one cell value before visualizing.");
            return;
        }
        const activeRows = rows.filter(r =>
            columns.some(col => String(r[col] ?? "").trim() !== "")
        );
        const cleanName = datasetName.trim() || "Manual Dataset";
        navigate("/visualize", {
            state: {
                manualData: activeRows.length > 0 ? activeRows : rows,
                manualColumns: columns,
                manualRowLabels: rowLabels,
                datasetName: cleanName,
                category,
            },
        });
    };

    // Continue to preview and analysis
    const handleContinue = () => {
        const cleanName = datasetName.trim() || "Manual Dataset";

        const hasData = rows.some(r =>
            columns.some(col => String(r[col] ?? "").trim() !== "")
        );

        if (!hasData) {
            alert("Please enter at least one cell value before continuing.");
            return;
        }

        const activeRows = rows.filter(r =>
            columns.some(col => String(r[col] ?? "").trim() !== "")
        );
        const activeLabels = rowLabels.filter((_, i) =>
            columns.some(col => String(rows[i]?.[col] ?? "").trim() !== "")
        );

        navigate("/dataset/preview", {
            state: {
                manualData: activeRows.length > 0 ? activeRows : rows,
                manualColumns: columns,
                manualRowLabels: activeLabels.length > 0 ? activeLabels : rowLabels,
                datasetName: cleanName,
                category: category,
            },
        });
    };

    return (
        <div className="manual-page">
            <div className="manual-container">

                {/* ─── Top Header ─── */}
                <header className="manual-header">
                    <div>
                        <div className="manual-badge">✦ Manual Data Entry Studio</div>
                        <h1>{mode === "blank" ? "Create Your Own Dataset" : "Enter Dataset"}</h1>
                        <p>
                            {mode === "blank"
                                ? "Start from scratch — define your columns, name your rows, and fill in the data exactly how you need it."
                                : "Build your dataset directly in this spreadsheet grid, or paste rows seamlessly from Excel, Google Sheets, or raw CSV."}
                        </p>
                    </div>

                    <div className="manual-header-actions">
                        <button
                            className={`create-own-btn${mode === "blank" ? " active" : ""}`}
                            onClick={handleCreateOwn}
                            title="Start with a blank dataset"
                        >
                            ✨ Create Your Own Dataset
                        </button>
                        <button
                            className="manual-back-btn"
                            onClick={() => navigate("/dataset/create")}
                            title="Return to selection"
                        >
                            ← Back to Options
                        </button>
                    </div>
                </header>

                {/* ─── Blank Mode Banner ─── */}
                {mode === "blank" && (
                    <div className="blank-mode-banner">
                        <span className="blank-mode-banner-icon">🧩</span>
                        <div>
                            <strong>Blank Dataset Mode</strong> — Click any column header to rename it. Click a row label (left column) to rename it. Add or remove rows and columns freely.
                        </div>
                        <button
                            className="blank-mode-dismiss"
                            onClick={() => loadTemplate("sales")}
                            title="Load a sample template instead"
                        >
                            ↩ Load a Template Instead
                        </button>
                    </div>
                )}

                {/* ─── Metadata & Configuration Card ─── */}
                <section className="dataset-meta-card">
                    <div className="dataset-meta-left">
                        <div className="dataset-name-field">
                            <label htmlFor={`${uniqueFormId}-dataset-name`}>Dataset Name</label>
                            <div className="dataset-name-input-wrap">
                                <span className="dataset-name-icon">✎</span>
                                <input
                                    id={`${uniqueFormId}-dataset-name`}
                                    className="dataset-name-input"
                                    type="text"
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    placeholder="Enter dataset name (e.g. Sales Q3)"
                                />
                            </div>
                        </div>

                        <div className="dataset-category-field">
                            <label htmlFor={`${uniqueFormId}-dataset-cat`}>Domain Category</label>
                            <select
                                id={`${uniqueFormId}-dataset-cat`}
                                className="dataset-category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="General">General Data</option>
                                <option value="Sales">Sales & Revenue</option>
                                <option value="Marketing">Marketing & Traffic</option>
                                <option value="Operations">Operations & Inventory</option>
                                <option value="Education">Education & Academics</option>
                                <option value="Finance">Financial Records</option>
                            </select>
                        </div>
                    </div>

                    {/* Real-time stats strip */}
                    <div className="dataset-metrics-strip">
                        <div className="metric-pill">
                            <span className="metric-pill-icon">▦</span>
                            <div className="metric-pill-content">
                                <span>Rows</span>
                                <strong>{rows.length}</strong>
                            </div>
                        </div>

                        <div className="metric-pill">
                            <span className="metric-pill-icon">▥</span>
                            <div className="metric-pill-content">
                                <span>Columns</span>
                                <strong>{columns.length}</strong>
                            </div>
                        </div>

                        <div className="metric-pill">
                            <span className="metric-pill-icon">⚡</span>
                            <div className="metric-pill-content">
                                <span>Filled</span>
                                <strong>{fillRate}%</strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Sample Templates & Quick Import Bar ─── */}
                <section className="templates-strip">
                    <div className="templates-label">
                        <span>⚡ Quick Templates:</span>
                        <div className="templates-chips">
                            <button
                                className="template-chip"
                                onClick={() => loadTemplate("sales")}
                                title="Load sample Sales Revenue dataset"
                            >
                                📈 Sales Revenue
                            </button>
                            <button
                                className="template-chip"
                                onClick={() => loadTemplate("inventory")}
                                title="Load sample Product Inventory dataset"
                            >
                                📦 Inventory
                            </button>
                            <button
                                className="template-chip"
                                onClick={() => loadTemplate("analytics")}
                                title="Load sample Web Growth Analytics dataset"
                            >
                                🌐 Web Traffic
                            </button>
                            <button
                                className="template-chip"
                                onClick={() => loadTemplate("grades")}
                                title="Load sample Student Academic dataset"
                            >
                                🎓 Academic Scores
                            </button>
                        </div>
                    </div>

                    <div className="utility-buttons">
                        <button
                            className="utility-btn"
                            onClick={() => setShowPasteModal(true)}
                            title="Paste rows from Excel or CSV"
                        >
                            📋 Paste CSV / Sheets
                        </button>
                        <button
                            className="utility-btn"
                            onClick={handleExportCSV}
                            title="Download grid as CSV"
                        >
                            ⤓ Export CSV
                        </button>
                        <button
                            className="utility-btn danger"
                            onClick={handleClearAll}
                            title="Reset all rows and columns"
                        >
                            ✕ Clear All
                        </button>
                    </div>
                </section>

                {/* ─── Spreadsheet Table Card ─── */}
                <section className="manual-table-card">
                    {/* Toolbar */}
                    <div className="manual-table-toolbar">
                        <div className="toolbar-title">
                            <h2>Spreadsheet Data Grid</h2>
                            <span className="toolbar-hint">
                                (Click cell to edit · Tab/Enter moves down · Delete row on right)
                            </span>
                        </div>

                        <div className="table-action-btns">
                            <button className="table-btn table-btn-primary" onClick={addColumn}>
                                + Add Column
                            </button>
                            <button className="table-btn table-btn-secondary" onClick={addRow}>
                                + Add Row
                            </button>
                            <button className="table-btn table-btn-secondary" onClick={() => addMultipleRows(5)}>
                                + 5 Rows
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="manual-table-wrapper">
                        <table className="data-entry-table">
                            <thead>
                                <tr>
                                    <th className="row-number-header" title="Row label — click a row label to rename it">
                                        <span className="row-label-header-text">Row</span>
                                    </th>
                                    {columns.map((col) => {
                                        const typeIcon = getColumnTypeIcon(col);
                                        const isEditing = editingColName === col;
                                        return (
                                            <th key={col}>
                                                <div className="column-header-container">
                                                    <span className="column-type-badge" title={`Data type: ${typeIcon === "123" ? "Numeric" : "Text"}`}>
                                                        {typeIcon}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="column-title-input"
                                                        value={isEditing ? colNameDraft : col}
                                                        onFocus={() => startEditingCol(col)}
                                                        onChange={(e) => setColNameDraft(e.target.value)}
                                                        onBlur={commitColRename}
                                                        onKeyDown={handleColNameKeyDown}
                                                        title="Click to rename column"
                                                    />
                                                    {columns.length > 1 && (
                                                        <button
                                                            className="column-del-btn"
                                                            onClick={() => deleteColumn(col)}
                                                            title="Delete this column"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="action-header" title="Row actions">Del</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {/* ─── Editable Row Label ─── */}
                                        <td className="row-number-cell">
                                            {editingLabelIdx === rowIndex ? (
                                                <input
                                                    ref={labelInputRef}
                                                    className="row-label-edit-input"
                                                    type="text"
                                                    value={labelDraft}
                                                    onChange={(e) => setLabelDraft(e.target.value)}
                                                    onBlur={commitLabelEdit}
                                                    onKeyDown={handleLabelKeyDown}
                                                    placeholder={`Row ${rowIndex + 1}`}
                                                />
                                            ) : (
                                                <button
                                                    className="row-label-display"
                                                    onClick={() => startEditingLabel(rowIndex)}
                                                    title="Click to rename this row"
                                                >
                                                    <span className="row-label-text">
                                                        {rowLabels[rowIndex] || `Row ${rowIndex + 1}`}
                                                    </span>
                                                    <span className="row-label-edit-icon">✎</span>
                                                </button>
                                            )}
                                        </td>

                                        {columns.map((col, colIndex) => (
                                            <td key={col}>
                                                <input
                                                    id={`cell-${rowIndex}-${colIndex}`}
                                                    className="data-cell-input"
                                                    type="text"
                                                    value={row[col] ?? ""}
                                                    onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                                    placeholder="—"
                                                />
                                            </td>
                                        ))}
                                        <td className="action-cell">
                                            <button
                                                className="row-delete-btn"
                                                onClick={() => deleteRow(rowIndex)}
                                                title={`Delete row "${rowLabels[rowIndex] || `Row ${rowIndex + 1}`}"`}
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick Add Row Button Strip */}
                    <div className="add-row-quick-bar">
                        <button className="add-row-quick-btn" onClick={addRow}>
                            + Add New Row
                        </button>
                        <button className="add-row-quick-btn" onClick={() => addMultipleRows(5)}>
                            + Add 5 Rows
                        </button>
                    </div>

                    {/* Footer / Submit Bar */}
                    <div className="manual-table-footer">
                        <div className="footer-info">
                            <span className="footer-stats-badge">
                                <strong>{rows.length}</strong> rows × <strong>{columns.length}</strong> columns (<strong>{filledCells}</strong> active values)
                            </span>
                            <div className={`footer-health-status ${filledCells > 0 ? "ready" : "warning"}`}>
                                {filledCells > 0 ? "● Ready for analysis" : "▲ Enter some data to continue"}
                            </div>
                        </div>

                        <div className="footer-actions">
                            <button
                                className="visualize-btn"
                                onClick={handleVisualize}
                            >
                                📊 Visualize Data
                            </button>
                            <button
                                className="continue-analysis-btn"
                                onClick={handleContinue}
                            >
                                Continue to Preview & Analysis →
                            </button>
                        </div>
                    </div>
                </section>

            </div>

            {/* ─── Modal for Pasting CSV / Excel data ─── */}
            {showPasteModal && (
                <div className="paste-modal-overlay" onClick={() => setShowPasteModal(false)}>
                    <div className="paste-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="paste-modal-header">
                            <h3>Paste Spreadsheet or CSV Data</h3>
                            <button className="paste-modal-close" onClick={() => setShowPasteModal(false)}>×</button>
                        </div>

                        <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5" }}>
                            Copy cells from Excel, Google Sheets, or a raw CSV file and paste below.
                            The first row will be automatically treated as column titles.
                        </p>

                        <textarea
                            className="paste-textarea"
                            value={pasteRawText}
                            onChange={(e) => setPasteRawText(e.target.value)}
                            placeholder="Month	Region	Revenue ($)	Units Sold
January	North	45200	320
February	South	38900	285"
                            autoFocus
                        />

                        <div className="paste-modal-actions">
                            <button
                                className="table-btn table-btn-secondary"
                                onClick={() => setShowPasteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="table-btn table-btn-primary"
                                onClick={handleApplyPaste}
                            >
                                Parse & Load into Table
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManualDataset;