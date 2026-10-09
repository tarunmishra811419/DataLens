/**
 * ComparisonCard Component
 * Displays a side-by-side comparison between two items or metrics with delta indicator.
 */
export default function ComparisonCard({
    title,
    itemAName = "Dataset A",
    itemAValue,
    itemBName = "Dataset B",
    itemBValue,
    delta,
    unit = "",
}) {
    const isPositive = Number(delta) >= 0;

    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.035)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "18px 20px",
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                }}
            >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>
                    {title}
                </span>
                {delta !== undefined && (
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            color: isPositive ? "#34d399" : "#f87171",
                            background: isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        }}
                    >
                        {isPositive ? "↑ +" : "↓ "}
                        {delta}%
                    </span>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: "12px",
                    alignItems: "center",
                }}
            >
                <div>
                    <div style={{ fontSize: "11px", color: "#818cf8", fontWeight: 700, textTransform: "uppercase" }}>
                        {itemAName}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>
                        {itemAValue} {unit}
                    </div>
                </div>

                <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                    vs
                </div>

                <div>
                    <div style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>
                        {itemBName}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>
                        {itemBValue} {unit}
                    </div>
                </div>
            </div>
        </div>
    );
}
