import { useNavigate } from "react-router-dom";
import "./CreateDataset.css";

function CreateDataset() {
    const navigate = useNavigate();

    return (
        <div className="dataset-page">
            <div className="dataset-container">
                <div className="dataset-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <span>DATA MANAGEMENT</span>
                        <h1>Create a Dataset</h1>
                        <p>
                            Add structured data to start creating visualizations
                            and computing analytical metrics.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#cbd5e1",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="dataset-options">
                    <div
                        className="dataset-option"
                        onClick={() => navigate("/dataset/manual")}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                navigate("/dataset/manual");
                            }
                        }}
                    >
                        <div className="option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="3" y1="15" x2="21" y2="15" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                                <line x1="15" y1="3" x2="15" y2="21" />
                            </svg>
                        </div>

                        <h2>Manual Data Entry</h2>
                        <p>
                            Type or paste rows directly into an interactive spreadsheet grid with configurable headers and cells.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/dataset/manual");
                            }}
                        >
                            Open Table Editor →
                        </button>
                    </div>

                    <div
                        className="dataset-option"
                        onClick={() => navigate("/dataset/upload")}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                navigate("/dataset/upload");
                            }
                        }}
                    >
                        <div className="option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>

                        <h2>File Upload</h2>
                        <p>
                            Import CSV, Excel (.xlsx, .xls), JSON, or TSV spreadsheets with automatic column type inference.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/dataset/upload");
                            }}
                        >
                            Select File to Import →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateDataset;