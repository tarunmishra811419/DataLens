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
                            Add your data to start creating visualizations
                            and discovering insights.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 18px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#cbd5e1",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            backdropFilter: "blur(10px)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                            e.currentTarget.style.color = "#ffffff";
                            e.currentTarget.style.transform = "translateX(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                            e.currentTarget.style.color = "#cbd5e1";
                            e.currentTarget.style.transform = "translateX(0)";
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
                        <div className="option-icon">✦</div>

                        <h2>Enter Data</h2>

                        <p>
                            Manually enter your data using a simple
                            spreadsheet-style interface.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/dataset/manual");
                            }}
                        >
                            Start with Table →
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
                        <div className="option-icon">↑</div>

                        <h2>Upload File</h2>

                        <p>
                            Upload a CSV or other supported data file
                            and start analyzing it.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/dataset/upload");
                            }}
                        >
                            Upload Dataset →
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default CreateDataset;