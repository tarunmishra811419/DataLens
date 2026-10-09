import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import DatasetStats from "./DatasetStats";
import DataQuality from "./DataQuality";
import "./DataPreview.css";

function DataPreview() {
    const location = useLocation();
    const navigate = useNavigate();

    const file = location.state?.file;
    const manualData = location.state?.manualData;
    const manualColumns = location.state?.manualColumns;
    const datasetName = location.state?.datasetName || file?.name || "Dataset Preview";
    const isManual = Boolean(manualData && manualColumns);

    const [data, setData] = useState(() => (isManual ? (manualData || []) : []));
    const [columns, setColumns] = useState(() => (isManual ? (manualColumns || []) : []));
    const [error, setError] = useState("");

    useEffect(() => {
        if (isManual || !file) {
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(
                        "There was a problem reading this CSV file."
                    );
                    return;
                }

                const rows = results.data;

                setData(rows);

                if (rows.length > 0) {
                    setColumns(Object.keys(rows[0]));
                }
            },

            error: () => {
                setError("Unable to read the CSV file.");
            },
        });
    }, [file, isManual, manualData, manualColumns]);

    if (!file && !isManual) {
        return (
            <div className="preview-page">
                <div className="preview-empty">

                    <h1>No dataset selected</h1>

                    <p>
                        Please upload a CSV file or enter data manually first.
                    </p>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
                        <button
                            onClick={() =>
                                navigate("/dataset/manual")
                            }
                        >
                            Enter Data Manually
                        </button>
                        <button
                            onClick={() =>
                                navigate("/dataset/upload")
                            }
                        >
                            Upload Dataset
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="preview-page">

            <div className="preview-container">

                {/* Header */}

                <div className="preview-header">

                    <div>
                        <span>DATA PREVIEW {isManual && "· MANUAL ENTRY"}</span>

                        <h1>{datasetName}</h1>

                        <p>
                            Preview your data before starting
                            the analysis.
                        </p>
                    </div>

                    <button
                        className="preview-back"
                        onClick={() =>
                            navigate(isManual ? "/dataset/manual" : "/dataset/upload")
                        }
                    >
                        {isManual ? "← Back to Data Entry" : "← Change File"}
                    </button>

                </div>

                {/* Error */}

                {error && (
                    <div className="preview-error">
                        {error}
                    </div>
                )}

                {/* Dataset Statistics */}

                {!error && data.length > 0 && (
                    <DatasetStats
                        data={data}
                        columns={columns}
                    />
                )}

                {/* Data Quality */}

                {!error && data.length > 0 && (
                    <DataQuality
                        data={data}
                        columns={columns}
                    />
                )}

                {/* Data Table */}

                {!error && data.length > 0 && (
                    <div className="preview-card">

                        <div className="table-wrapper">

                            <table>

                                <thead>
                                    <tr>
                                        {columns.map(
                                            (column) => (
                                                <th key={column}>
                                                    {column}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data
                                        .slice(0, 10)
                                        .map(
                                            (
                                                row,
                                                rowIndex
                                            ) => (
                                                <tr
                                                    key={
                                                        rowIndex
                                                    }
                                                >
                                                    {columns.map(
                                                        (
                                                            column
                                                        ) => (
                                                            <td
                                                                key={
                                                                    column
                                                                }
                                                            >
                                                                {
                                                                    row[
                                                                    column
                                                                    ]
                                                                }
                                                            </td>
                                                        )
                                                    )}
                                                </tr>
                                            )
                                        )}
                                </tbody>

                            </table>

                        </div>

                        <div className="preview-footer">
                            Showing first{" "}
                            {Math.min(
                                data.length,
                                10
                            )}{" "}
                            rows of {data.length}.
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 0 4px" }}>
                            <button
                                onClick={() => navigate("/visualize", {
                                    state: {
                                        manualData: data,
                                        manualColumns: columns,
                                        datasetName: datasetName,
                                    }
                                })}
                                style={{
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    color: "#fff",
                                    padding: "12px 28px",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                                    transition: "all 0.2s",
                                    fontFamily: "inherit",
                                }}
                                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 32px rgba(99,102,241,0.5)"; }}
                                onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 24px rgba(99,102,241,0.35)"; }}
                            >
                                📊 Visualize This Data →
                            </button>
                        </div>

                    </div>
                )}

                {/* Empty CSV */}

                {!error && data.length === 0 && (
                    <div className="preview-empty">

                        <h2>
                            No data found
                        </h2>

                        <p>
                            This CSV file doesn't
                            contain any data rows.
                        </p>

                    </div>
                )}

            </div>

        </div>
    );
}

export default DataPreview;