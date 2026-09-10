import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadDataset.css";

function UploadDataset() {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            alert("Please select a CSV file.");
            return;
        }

        setFile(selectedFile);
    };

    const handleContinue = () => {
        if (!file) {
            alert("Please select a CSV file first.");
            return;
        }

        navigate("/dataset/preview", {
            state: { file },
        });
    };

    return (
        <div className="upload-page">
            <div className="upload-container">

                <div className="upload-header">
                    <span>DATA IMPORT</span>

                    <h1>Upload your dataset</h1>

                    <p>
                        Upload a CSV file and let DataLens
                        prepare it for analysis.
                    </p>
                </div>

                <div className="upload-card">

                    <div className="upload-icon">
                        ↑
                    </div>

                    <h2>
                        {file
                            ? file.name
                            : "Drop your CSV file here"}
                    </h2>

                    <p>
                        {file
                            ? `${(
                                file.size / 1024
                            ).toFixed(1)} KB selected`
                            : "or click the button below to browse your computer"}
                    </p>

                    <label className="upload-button">
                        {file
                            ? "Choose another file"
                            : "Choose CSV File"}

                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            hidden
                        />
                    </label>

                    {file && (
                        <>
                            <div className="selected-file">
                                <span>✓</span>

                                <div>
                                    <strong>
                                        {file.name}
                                    </strong>

                                    <small>
                                        {(
                                            file.size / 1024
                                        ).toFixed(1)} KB
                                    </small>
                                </div>
                            </div>

                            <button
                                className="continue-button"
                                onClick={handleContinue}
                            >
                                Continue to Preview →
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default UploadDataset;