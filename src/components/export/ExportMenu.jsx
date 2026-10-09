import { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Reusable Export Menu Component
 * Allows downloading datasets in CSV, Excel (XLSX), or JSON format.
 */
export default function ExportMenu({
    data = [],
    columns = [],
    filename = "datalens_export",
    buttonLabel = "Export Data ▾",
    buttonStyle = {},
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const exportCSV = () => {
        if (!data || data.length === 0) return;
        const csv = Papa.unparse(data, { columns: columns.length > 0 ? columns : undefined });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${filename}.csv`);
        setIsOpen(false);
    };

    const exportJSON = () => {
        if (!data || data.length === 0) return;
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
        saveAs(blob, `${filename}.json`);
        setIsOpen(false);
    };

    const exportExcel = () => {
        if (!data || data.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(data, {
            header: columns.length > 0 ? columns : undefined,
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${filename}.xlsx`);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#f1f5f9",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    ...buttonStyle,
                }}
            >
                {buttonLabel}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 6px)",
                        background: "#0f172a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                        padding: "6px",
                        minWidth: "160px",
                        zIndex: 100,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                    }}
                >
                    <button
                        type="button"
                        onClick={exportCSV}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#e2e8f0",
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: "13px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <span>📄</span> Export as CSV
                    </button>

                    <button
                        type="button"
                        onClick={exportExcel}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#e2e8f0",
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: "13px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <span>📊</span> Export as Excel (.xlsx)
                    </button>

                    <button
                        type="button"
                        onClick={exportJSON}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#e2e8f0",
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: "13px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <span>🔧</span> Export as JSON
                    </button>
                </div>
            )}
        </div>
    );
}
