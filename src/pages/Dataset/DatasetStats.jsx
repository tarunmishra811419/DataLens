import "./DatasetStats.css";

function DatasetStats({ data, columns }) {
    const totalRows = data.length;
    const totalColumns = columns.length;

    const numericColumns = columns.filter((column) => {
        const values = data
            .map((row) => row[column])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            );

        if (values.length === 0) {
            return false;
        }

        return values.every((value) => {
            return !isNaN(Number(value));
        });
    });

    const textColumns = columns.filter(
        (column) => !numericColumns.includes(column)
    );

    let missingValues = 0;

    data.forEach((row) => {
        columns.forEach((column) => {
            const value = row[column];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                missingValues++;
            }
        });
    });

    const stats = [
        {
            label: "Total Rows",
            value: totalRows,
            icon: "▦",
        },
        {
            label: "Total Columns",
            value: totalColumns,
            icon: "▥",
        },
        {
            label: "Numeric Columns",
            value: numericColumns.length,
            icon: "⌁",
        },
        {
            label: "Text Columns",
            value: textColumns.length,
            icon: "Aa",
        },
        {
            label: "Missing Values",
            value: missingValues,
            icon: "!",
        },
    ];

    return (
        <div className="dataset-stats">

            <div className="stats-heading">
                <span>DATASET OVERVIEW</span>

                <h2>
                    Quick Statistics
                </h2>

                <p>
                    A quick summary of the structure
                    and quality of your dataset.
                </p>
            </div>

            <div className="stats-grid">

                {stats.map((stat) => (
                    <div
                        className="stat-card"
                        key={stat.label}
                    >
                        <div className="stat-icon">
                            {stat.icon}
                        </div>

                        <div className="stat-content">
                            <span>
                                {stat.label}
                            </span>

                            <strong>
                                {stat.value}
                            </strong>
                        </div>
                    </div>
                ))}

            </div>

        </div>
    );
}

export default DatasetStats;