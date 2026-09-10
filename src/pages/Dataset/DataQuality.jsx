import "./DataQuality.css";

function DataQuality({ data, columns }) {
    const totalRows = data.length;
    const totalCells = totalRows * columns.length;

    // -----------------------------
    // Missing Values
    // -----------------------------

    let missingCells = 0;

    data.forEach((row) => {
        columns.forEach((column) => {
            const value = row[column];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                missingCells++;
            }
        });
    });

    const missingPercentage =
        totalCells > 0
            ? ((missingCells / totalCells) * 100).toFixed(1)
            : 0;

    // -----------------------------
    // Duplicate Rows
    // -----------------------------

    const rowSet = new Set();

    data.forEach((row) => {
        const rowString = columns
            .map((column) => row[column] ?? "")
            .join("|||");

        rowSet.add(rowString);
    });

    const duplicateRows = totalRows - rowSet.size;

    // -----------------------------
    // Column Data Types
    // -----------------------------

    const columnTypes = columns.map((column) => {
        const values = data
            .map((row) => row[column])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            );

        if (values.length === 0) {
            return {
                name: column,
                type: "Empty",
                missing: totalRows,
            };
        }

        const numeric = values.every(
            (value) => !isNaN(Number(value))
        );

        return {
            name: column,
            type: numeric ? "Numeric" : "Text",
            missing: totalRows - values.length,
        };
    });

    // -----------------------------
    // Quality Score
    // -----------------------------

    let qualityScore = 100;

    if (totalCells > 0) {
        qualityScore -=
            (missingCells / totalCells) * 60;
    }

    if (totalRows > 0) {
        qualityScore -=
            (duplicateRows / totalRows) * 40;
    }

    qualityScore = Math.max(
        0,
        Math.min(100, Math.round(qualityScore))
    );

    let qualityLabel = "Excellent";

    if (qualityScore < 90) {
        qualityLabel = "Good";
    }

    if (qualityScore < 70) {
        qualityLabel = "Needs Attention";
    }

    if (qualityScore < 40) {
        qualityLabel = "Poor";
    }

    return (
        <section className="data-quality">

            <div className="quality-heading">
                <span>DATA QUALITY</span>

                <h2>
                    Dataset Health
                </h2>

                <p>
                    Check the completeness and
                    consistency of your dataset.
                </p>
            </div>

            {/* Quality Summary */}

            <div className="quality-summary">

                <div className="quality-score">

                    <div className="score-circle">
                        <strong>
                            {qualityScore}
                        </strong>

                        <span>/100</span>
                    </div>

                    <div>
                        <span>
                            Overall Quality
                        </span>

                        <h3>
                            {qualityLabel}
                        </h3>
                    </div>

                </div>

                <div className="quality-metrics">

                    <div>
                        <span>
                            Missing Cells
                        </span>

                        <strong>
                            {missingCells}
                        </strong>

                        <small>
                            {missingPercentage}% of data
                        </small>
                    </div>

                    <div>
                        <span>
                            Duplicate Rows
                        </span>

                        <strong>
                            {duplicateRows}
                        </strong>

                        <small>
                            {totalRows > 0
                                ? (
                                    (duplicateRows /
                                        totalRows) *
                                    100
                                ).toFixed(1)
                                : 0}
                            % of rows
                        </small>
                    </div>

                </div>

            </div>

            {/* Column Analysis */}

            <div className="column-quality">

                <div className="column-quality-header">
                    <h3>
                        Column Analysis
                    </h3>

                    <span>
                        {columns.length} columns
                    </span>
                </div>

                <div className="column-list">

                    {columnTypes.map((column) => (
                        <div
                            className="column-item"
                            key={column.name}
                        >
                            <div className="column-name">
                                <strong>
                                    {column.name}
                                </strong>

                                <span
                                    className={`type-badge ${column.type ===
                                            "Numeric"
                                            ? "numeric"
                                            : column.type ===
                                                "Text"
                                                ? "text"
                                                : "empty"
                                        }`}
                                >
                                    {column.type}
                                </span>
                            </div>

                            <div className="column-missing">
                                <span>
                                    Missing
                                </span>

                                <strong>
                                    {column.missing}
                                </strong>
                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}

export default DataQuality;