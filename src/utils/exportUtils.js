// ═══════════════════════════════════════════════
// DataLens — Export Utilities
// Export data to CSV, Excel, PDF and download
// charts as PNG/PDF images.
// ═══════════════════════════════════════════════

import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

// ═══════════════════════════════════════════════
// Data Export Functions
// ═══════════════════════════════════════════════

/**
 * Export dataset rows to a CSV file and trigger download.
 * @param {Object[]} rows - Array of row objects
 * @param {string[]} columns - Column names
 * @param {string} fileName - File name without extension
 */
export function exportToCSV(rows, columns, fileName = "dataset") {
    if (!rows || rows.length === 0) {
        throw new Error("No data to export");
    }

    // Build ordered data array
    const orderedData = rows.map((row) => {
        const orderedRow = {};
        columns.forEach((col) => {
            orderedRow[col] = row[col] ?? "";
        });
        return orderedRow;
    });

    const csv = Papa.unparse(orderedData, {
        columns: columns,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${sanitizeFileName(fileName)}.csv`);

    return { success: true, format: "csv", rows: rows.length };
}

/**
 * Export dataset rows to an Excel (.xlsx) file.
 * @param {Object[]} rows - Array of row objects
 * @param {string[]} columns - Column names
 * @param {string} fileName - File name without extension
 * @param {string} sheetName - Sheet name
 */
export function exportToExcel(rows, columns, fileName = "dataset", sheetName = "Data") {
    if (!rows || rows.length === 0) {
        throw new Error("No data to export");
    }

    // Build ordered 2D array with headers
    const headerRow = columns;
    const dataRows = rows.map((row) =>
        columns.map((col) => row[col] ?? "")
    );

    const worksheetData = [headerRow, ...dataRows];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const colWidths = columns.map((col, i) => {
        const maxLength = Math.max(
            col.length,
            ...dataRows.map((row) => String(row[i] ?? "").length)
        );
        return { wch: Math.min(maxLength + 2, 40) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sanitizeFileName(fileName)}.xlsx`);

    return { success: true, format: "xlsx", rows: rows.length };
}

/**
 * Export dataset as a PDF document with a table.
 * @param {Object[]} rows - Array of row objects
 * @param {string[]} columns - Column names
 * @param {string} fileName - File name without extension
 * @param {string} title - Document title
 */
export function exportToPDF(rows, columns, fileName = "dataset", title = "DataLens Export") {
    if (!rows || rows.length === 0) {
        throw new Error("No data to export");
    }

    const doc = new jsPDF({
        orientation: columns.length > 5 ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // ─── Title ───
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    // ─── Date ───
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(`Exported on ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 27, { align: "center" });

    // ─── Table ───
    doc.setTextColor(0, 0, 0);
    const startY = 35;
    const margin = 14;
    const tableWidth = pageWidth - margin * 2;
    const colWidth = tableWidth / columns.length;
    const rowHeight = 8;
    let currentY = startY;

    // Header row
    doc.setFillColor(99, 102, 241); // Primary color
    doc.rect(margin, currentY, tableWidth, rowHeight, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    columns.forEach((col, i) => {
        doc.text(
            truncate(col, 20),
            margin + i * colWidth + 2,
            currentY + 5.5
        );
    });

    currentY += rowHeight;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // Data rows
    rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (currentY + rowHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            currentY = 20;
        }

        // Alternate row background
        if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, currentY, tableWidth, rowHeight, "F");
        }

        doc.setFontSize(7);
        columns.forEach((col, i) => {
            const value = String(row[col] ?? "");
            doc.text(
                truncate(value, 22),
                margin + i * colWidth + 2,
                currentY + 5.5
            );
        });

        currentY += rowHeight;
    });

    // ─── Footer ───
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(
            `DataLens • Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: "center" }
        );
    }

    doc.save(`${sanitizeFileName(fileName)}.pdf`);

    return { success: true, format: "pdf", rows: rows.length };
}

// ═══════════════════════════════════════════════
// Chart Export Functions
// ═══════════════════════════════════════════════

/**
 * Download a chart as a PNG image.
 * @param {HTMLElement} chartElement - The DOM element containing the chart
 * @param {string} fileName - File name without extension
 */
export async function downloadChartAsPNG(chartElement, fileName = "chart") {
    if (!chartElement) throw new Error("Chart element not found");

    const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
    });

    canvas.toBlob((blob) => {
        if (blob) {
            saveAs(blob, `${sanitizeFileName(fileName)}.png`);
        }
    }, "image/png");

    return { success: true, format: "png" };
}

/**
 * Download a chart as a PDF document.
 * @param {HTMLElement} chartElement - The DOM element containing the chart
 * @param {string} fileName - File name without extension
 * @param {string} title - Chart title
 */
export async function downloadChartAsPDF(chartElement, fileName = "chart", title = "Chart") {
    if (!chartElement) throw new Error("Chart element not found");

    const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Determine orientation based on aspect ratio
    const orientation = imgWidth > imgHeight ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 15, { align: "center" });

    // Scale image to fit page
    const maxWidth = pageWidth - 20;
    const maxHeight = pageHeight - 40;
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;

    const x = (pageWidth - finalWidth) / 2;
    doc.addImage(imgData, "PNG", x, 22, finalWidth, finalHeight);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("Exported from DataLens", pageWidth / 2, pageHeight - 8, { align: "center" });

    doc.save(`${sanitizeFileName(fileName)}.pdf`);

    return { success: true, format: "pdf" };
}

/**
 * Download a Chart.js canvas directly as PNG.
 * Works with chart refs from react-chartjs-2.
 * @param {Object} chartRef - React ref to Chart.js canvas
 * @param {string} fileName
 */
export function downloadChartCanvasAsPNG(chartRef, fileName = "chart") {
    if (!chartRef || !chartRef.current) throw new Error("Chart ref not found");

    const chart = chartRef.current;
    const url = chart.toBase64Image("image/png", 1);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName(fileName)}.png`;
    link.click();

    return { success: true, format: "png" };
}

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

/**
 * Sanitize a file name (remove special characters).
 */
function sanitizeFileName(name) {
    return name
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 100)
        || "datalens_export";
}

/**
 * Truncate text for PDF cells.
 */
function truncate(text, maxLen) {
    if (!text) return "";
    return text.length > maxLen ? text.substring(0, maxLen - 1) + "…" : text;
}

/**
 * Estimate the file size of an export before downloading.
 * @param {Object[]} rows
 * @param {string} format - "csv" | "xlsx" | "pdf"
 * @returns {string} Human readable size estimate
 */
export function estimateExportSize(rows, format) {
    if (!rows || rows.length === 0) return "0 B";

    const avgRowSize = 100; // rough bytes per row
    const totalBytes = rows.length * avgRowSize;

    const multipliers = {
        csv: 1,
        xlsx: 1.3,
        pdf: 2.5,
    };

    const estimated = totalBytes * (multipliers[format] || 1);

    if (estimated >= 1024 * 1024) return `~${(estimated / (1024 * 1024)).toFixed(1)} MB`;
    if (estimated >= 1024) return `~${(estimated / 1024).toFixed(0)} KB`;
    return `~${estimated} B`;
}
