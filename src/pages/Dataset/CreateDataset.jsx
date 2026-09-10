import "./CreateDataset.css";

function CreateDataset() {
    return (
        <div className="dataset-page">

            <div className="dataset-container">

                <div className="dataset-header">
                    <span>DATA MANAGEMENT</span>

                    <h1>Create a Dataset</h1>

                    <p>
                        Add your data to start creating visualizations
                        and discovering insights.
                    </p>
                </div>

                <div className="dataset-options">

                    <div className="dataset-option">
                        <div className="option-icon">✦</div>

                        <h2>Enter Data</h2>

                        <p>
                            Manually enter your data using a simple
                            spreadsheet-style interface.
                        </p>

                        <button>
                            Start with Table →
                        </button>
                    </div>

                    <div className="dataset-option">
                        <div className="option-icon">↑</div>

                        <h2>Upload File</h2>

                        <p>
                            Upload a CSV or other supported data file
                            and start analyzing it.
                        </p>

                        <button>
                            Upload Dataset →
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default CreateDataset;