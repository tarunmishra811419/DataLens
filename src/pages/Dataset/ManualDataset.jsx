import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManualDataset.css";

function ManualDataset() {
    const navigate = useNavigate();

    const [datasetName, setDatasetName] = useState(
        "My Dataset"
    );

    const [columns, setColumns] = useState([
        "Column 1",
        "Column 2",
        "Column 3",
    ]);

    const [rows, setRows] = useState([
        {
            "Column 1": "",
            "Column 2": "",
            "Column 3": "",
        },
        {
            "Column 1": "",
            "Column 2": "",
            "Column 3": "",
        },
        {
            "Column 1": "",
            "Column 2": "",
            "Column 3": "",
        },
    ]);

    const handleCellChange = (
        rowIndex,
        column,
        value
    ) => {
        setRows((currentRows) => {
            const updatedRows = [...currentRows];

            updatedRows[rowIndex] = {
                ...updatedRows[rowIndex],
                [column]: value,
            };

            return updatedRows;
        });
    };

    const addRow = () => {
        const newRow = {};

        columns.forEach((column) => {
            newRow[column] = "";
        });

        setRows((currentRows) => [
            ...currentRows,
            newRow,
        ]);
    };

    const deleteRow = (rowIndex) => {
        setRows((currentRows) =>
            currentRows.filter(
                (_, index) => index !== rowIndex
            )
        );
    };

    const addColumn = () => {
        const newColumnName = `Column ${columns.length + 1
            }`;

        setColumns((currentColumns) => [
            ...currentColumns,
            newColumnName,
        ]);

        setRows((currentRows) =>
            currentRows.map((row) => ({
                ...row,
                [newColumnName]: "",
            }))
        );
    };

    const deleteColumn = (columnToDelete) => {
        if (columns.length === 1) {
            alert(
                "A dataset must have at least one column."
            );
            return;
        }

        setColumns((currentColumns) =>
            currentColumns.filter(
                (column) => column !== columnToDelete
            )
        );

        setRows((currentRows) =>
            currentRows.map((row) => {
                const updatedRow = {
                    ...row,
                };

                delete updatedRow[columnToDelete];

                return updatedRow;
            })
        );
    };

    const handleColumnNameChange = (
        oldName,
        newName
    ) => {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            return;
        }

        if (
            columns.some(
                (column) =>
                    column !== oldName &&
                    column === trimmedName
            )
        ) {
            alert(
                "Column names must be unique."
            );
            return;
        }

        setColumns((currentColumns) =>
            currentColumns.map((column) =>
                column === oldName
                    ? trimmedName
                    : column
            )
        );

        setRows((currentRows) =>
            currentRows.map((row) => {
                const updatedRow = {
                    ...row,
                };

                updatedRow[trimmedName] =
                    updatedRow[oldName];

                delete updatedRow[oldName];

                return updatedRow;
            })
        );
    };

    const handleContinue = () => {
        const cleanName = datasetName.trim();

        if (!cleanName) {
            alert(
                "Please enter a dataset name."
            );
            return;
        }

        const hasData = rows.some((row) =>
            columns.some(
                (column) =>
                    String(
                        row[column] ?? ""
                    ).trim() !== ""
            )
        );

        if (!hasData) {
            alert(
                "Please enter at least one value."
            );
            return;
        }

        navigate("/dataset/preview", {
            state: {
                manualData: rows,
                manualColumns: columns,
                datasetName: cleanName,
            },
        });
    };

    return (
        <div className="manual-page">

            <div className="manual-container">

                {/* Header */}

                <div className="manual-header">

                    <div>
                        <span>
                            MANUAL DATA ENTRY
                        </span>

                        <h1>
                            Create your dataset
                        </h1>

                        <p>
                            Enter your data using the
                            spreadsheet below.
                        </p>
                    </div>

                    <button
                        className="manual-back"
                        onClick={() =>
                            navigate(
                                "/dataset/create"
                            )
                        }
                    >
                        ← Back
                    </button>

                </div>

                {/* Dataset Name */}

                <div className="dataset-name-card">

                    <label>
                        Dataset Name
                    </label>

                    <input
                        type="text"
                        value={datasetName}
                        onChange={(event) =>
                            setDatasetName(
                                event.target.value
                            )
                        }
                        placeholder="Enter dataset name"
                    />

                </div>

                {/* Table */}

                <div className="manual-table-card">

                    <div className="manual-table-header">

                        <div>
                            <h2>
                                Data Table
                            </h2>

                            <p>
                                Edit cells directly and
                                customize your columns.
                            </p>
                        </div>

                        <div className="table-actions">

                            <button
                                onClick={addColumn}
                            >
                                + Column
                            </button>

                            <button
                                onClick={addRow}
                            >
                                + Row
                            </button>

                        </div>

                    </div>

                    <div className="manual-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th className="row-number">
                                        #
                                    </th>

                                    {columns.map(
                                        (column) => (
                                            <th
                                                key={
                                                    column
                                                }
                                            >
                                                <div className="column-header">

                                                    <input
                                                        type="text"
                                                        value={
                                                            column
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleColumnNameChange(
                                                                column,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        onClick={() =>
                                                            deleteColumn(
                                                                column
                                                            )
                                                        }
                                                        title="Delete column"
                                                    >
                                                        ×
                                                    </button>

                                                </div>
                                            </th>
                                        )
                                    )}

                                    <th className="action-column">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {rows.map(
                                    (
                                        row,
                                        rowIndex
                                    ) => (
                                        <tr
                                            key={
                                                rowIndex
                                            }
                                        >

                                            <td className="row-number">
                                                {rowIndex +
                                                    1}
                                            </td>

                                            {columns.map(
                                                (
                                                    column
                                                ) => (
                                                    <td
                                                        key={
                                                            column
                                                        }
                                                    >
                                                        <input
                                                            type="text"
                                                            value={
                                                                row[
                                                                column
                                                                ] ??
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleCellChange(
                                                                    rowIndex,
                                                                    column,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Enter value"
                                                        />
                                                    </td>
                                                )
                                            )}

                                            <td className="action-column">

                                                <button
                                                    className="delete-row"
                                                    onClick={() =>
                                                        deleteRow(
                                                            rowIndex
                                                        )
                                                    }
                                                    title="Delete row"
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    <div className="manual-table-footer">

                        <span>
                            {rows.length} rows
                            {" · "}
                            {columns.length} columns
                        </span>

                        <button
                            className="continue-analysis"
                            onClick={
                                handleContinue
                            }
                        >
                            Continue to Analysis →
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ManualDataset;