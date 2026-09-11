// ═══════════════════════════════════════════════
// DataLens — Chart Recommender
// Analyzes column types and data patterns to
// suggest the best chart type automatically.
// ═══════════════════════════════════════════════

import { isNumeric } from "./validators";

// ─── Column Type Detection ───

/**
 * Detect the type of a column based on its values.
 * @param {string[]} values - All values in a column
 * @returns {"temporal"|"numeric"|"categorical"|"mixed"}
 */
export function detectColumnType(values) {
    if (!values || values.length === 0) return "mixed";

    const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
    if (nonEmpty.length === 0) return "mixed";

    // Check if temporal (dates, months, years, etc.)
    const temporalCount = nonEmpty.filter((v) => isTemporalValue(String(v))).length;
    if (temporalCount / nonEmpty.length > 0.7) return "temporal";

    // Check if numeric
    const numericCount = nonEmpty.filter((v) => isNumeric(v)).length;
    if (numericCount / nonEmpty.length > 0.7) return "numeric";

    // Otherwise categorical
    return "categorical";
}

/**
 * Check if a value represents a temporal value.
 */
function isTemporalValue(value) {
    const v = value.trim().toLowerCase();

    // Month names
    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
        "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
    ];
    if (months.includes(v)) return true;

    // Day names
    const days = [
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        "mon", "tue", "wed", "thu", "fri", "sat", "sun",
    ];
    if (days.includes(v)) return true;

    // Year (4-digit number between 1900-2100)
    if (/^\d{4}$/.test(v) && parseInt(v) >= 1900 && parseInt(v) <= 2100) return true;

    // Date patterns (YYYY-MM-DD, DD/MM/YYYY, MM-DD-YYYY, etc.)
    if (/^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(v)) return true;

    // Quarter patterns (Q1, Q2, Q3, Q4, Q1 2025, etc.)
    if (/^q[1-4](\s*\d{4})?$/i.test(v)) return true;

    // Week patterns (Week 1, W1, etc.)
    if (/^(week\s*|w)\d{1,2}$/i.test(v)) return true;

    // Check if valid Date object
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.length > 4) return true;

    return false;
}

/**
 * Analyze dataset columns and return type info for each.
 * @param {Object[]} rows - Dataset rows
 * @param {string[]} columns - Column names
 * @returns {Object} { columnName: { type, uniqueCount, sampleValues } }
 */
export function analyzeColumns(rows, columns) {
    const analysis = {};

    columns.forEach((col) => {
        const values = rows.map((row) => row[col]);
        const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
        const uniqueValues = [...new Set(nonEmpty.map((v) => String(v).trim().toLowerCase()))];

        analysis[col] = {
            type: detectColumnType(values),
            uniqueCount: uniqueValues.length,
            totalCount: nonEmpty.length,
            isEmpty: nonEmpty.length === 0,
            sampleValues: nonEmpty.slice(0, 5),
        };
    });

    return analysis;
}


// ─── Chart Recommendation Engine ───

/**
 * Recommend the best chart type based on data analysis.
 * @param {Object[]} rows - Dataset rows
 * @param {string[]} columns - Column names
 * @returns {{ recommended, explanation, alternatives, valueColumn, labelColumn }}
 */
export function recommendChart(rows, columns) {
    if (!rows || rows.length === 0 || !columns || columns.length === 0) {
        return {
            recommended: "bar",
            explanation: "Bar chart is a great default for getting started.",
            alternatives: ["line", "pie"],
            valueColumn: null,
            labelColumn: null,
        };
    }

    const analysis = analyzeColumns(rows, columns);
    const columnTypes = Object.entries(analysis);

    // Find temporal and numeric columns
    const temporalCols = columnTypes.filter(([, info]) => info.type === "temporal").map(([name]) => name);
    const numericCols = columnTypes.filter(([, info]) => info.type === "numeric").map(([name]) => name);
    const categoricalCols = columnTypes.filter(([, info]) => info.type === "categorical").map(([name]) => name);

    // Determine label column (prefer temporal, then categorical, then first column)
    const labelColumn = temporalCols[0] || categoricalCols[0] || columns[0];

    // Determine value column (first numeric column that isn't the label)
    const valueColumn = numericCols.find((col) => col !== labelColumn) || numericCols[0] || columns[1] || columns[0];

    const rowCount = rows.length;
    const labelInfo = analysis[labelColumn];
    const hasTemporal = temporalCols.length > 0;
    const hasMultipleNumeric = numericCols.length >= 2;
    const uniqueCategories = labelInfo ? labelInfo.uniqueCount : rowCount;

    // ─── Decision Logic ───

    // Time series data → Line chart
    if (hasTemporal && numericCols.length >= 1) {
        return {
            recommended: "line",
            explanation: "Line chart works best for tracking values over time.",
            alternatives: ["area", "bar"],
            valueColumn,
            labelColumn,
            allNumericColumns: numericCols,
        };
    }

    // Few categories (2-6) → Pie or Donut
    if (uniqueCategories >= 2 && uniqueCategories <= 6 && numericCols.length >= 1) {
        return {
            recommended: "pie",
            explanation: "Pie chart is ideal for showing proportions across a few categories.",
            alternatives: ["doughnut", "bar"],
            valueColumn,
            labelColumn,
            allNumericColumns: numericCols,
        };
    }

    // Medium categories (7-15) → Bar chart
    if (uniqueCategories >= 7 && uniqueCategories <= 15) {
        return {
            recommended: "bar",
            explanation: "Bar chart clearly compares values across multiple categories.",
            alternatives: ["line", "area"],
            valueColumn,
            labelColumn,
            allNumericColumns: numericCols,
        };
    }

    // Large dataset → Line or Area
    if (rowCount > 15) {
        return {
            recommended: "line",
            explanation: "Line chart handles large datasets well, showing trends clearly.",
            alternatives: ["area", "bar"],
            valueColumn,
            labelColumn,
            allNumericColumns: numericCols,
        };
    }

    // Multiple numeric columns → Grouped bar
    if (hasMultipleNumeric) {
        return {
            recommended: "bar",
            explanation: "Bar chart works great for comparing multiple numeric values side by side.",
            alternatives: ["line", "area"],
            valueColumn,
            labelColumn,
            allNumericColumns: numericCols,
        };
    }

    // Default → Bar chart
    return {
        recommended: "bar",
        explanation: "Bar chart is a versatile choice for your data.",
        alternatives: ["line", "pie"],
        valueColumn,
        labelColumn,
        allNumericColumns: numericCols,
    };
}

/**
 * Get a human-readable name for a chart type.
 */
export function getChartTypeName(type) {
    const names = {
        line: "Line Chart",
        bar: "Bar Chart",
        area: "Area Chart",
        pie: "Pie Chart",
        doughnut: "Donut Chart",
    };
    return names[type] || "Chart";
}

/**
 * Get the icon for a chart type.
 */
export function getChartTypeIcon(type) {
    const icons = {
        line: "📈",
        bar: "📊",
        area: "📉",
        pie: "🥧",
        doughnut: "🍩",
    };
    return icons[type] || "📊";
}
