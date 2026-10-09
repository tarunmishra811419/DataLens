import { useState } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

/**
 * Reusable DownloadChart Component
 * Exports a referenced DOM element (such as a chart container) to PNG, JPEG, or PDF.
 */
export default function DownloadChart({
    targetRef,
    filename = "chart_export",
    buttonLabel = "Download Chart",
    buttonStyle = {},
}) {
    const [isExporting, setIsExporting] = useState(false);
    const [format, setFormat] = useState("png");

    const handleDownload = async () => {
        if (!targetRef?.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(targetRef.current, {
                backgroundColor: "#0f172a",
                scale: 2,
                useCORS: true,
            });

            if (format === "png") {
                canvas.toBlob((blob) => {
                    if (blob) saveAs(blob, `${filename}.png`);
                }, "image/png");
            } else if (format === "jpg") {
                canvas.toBlob(
                    (blob) => {
                        if (blob) saveAs(blob, `${filename}.jpg`);
                    },
                    "image/jpeg",
                    0.92
                );
            } else if (format === "pdf") {
                const { jsPDF } = await import("jspdf");
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "px",
                    format: [canvas.width / 2, canvas.height / 2],
                });
                pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
                pdf.save(`${filename}.pdf`);
            }
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                }}
            >
                <option value="png">PNG</option>
                <option value="jpg">JPEG</option>
                <option value="pdf">PDF</option>
            </select>

            <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                style={{
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isExporting ? "wait" : "pointer",
                    opacity: isExporting ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    ...buttonStyle,
                }}
            >
                {isExporting ? "Exporting..." : `⤓ ${buttonLabel}`}
            </button>
        </div>
    );
}
