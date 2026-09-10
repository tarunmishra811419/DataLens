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

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!file) {
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
    }, [file]);

    if (!file) {
        return (
            <div className="preview-page">
                <div className="preview-empty">

                    <h1>No dataset selected</h1>

                    <p>
                        Please upload a CSV file first.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/dataset/upload")
                        }
                    >
                        Upload Dataset
                    </button>

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
                        <span>DATA PREVIEW</span>

                        <h1>{file.name}</h1>

                        <p>
                            Preview your data before starting
                            the analysis.
                        </p>
                    </div>

                    <button
                        className="preview-back"
                        onClick={() =>
                            navigate("/dataset/upload")
                        }
                    >
                        ← Change File
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