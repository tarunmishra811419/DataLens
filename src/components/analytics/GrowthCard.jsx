/**
 * GrowthCard Component
 * Highlights growth, acceleration, and percentage changes between data periods.
 */
export default function GrowthCard({
    title = "Growth Rate",
    currentValue,
    previousValue,
    percentChange,
    timeframe = "vs previous period",
    metric = "",
}) {
    const isPositive = Number(percentChange) >= 0;

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
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                {title}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff" }}>
                    {currentValue} {metric}
                </span>
                <span
                    style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: isPositive ? "#34d399" : "#f87171",
                        background: isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                    }}
                >
                    {isPositive ? "↑ +" : "↓ "}
                    {percentChange}%
                </span>
            </div>

            <div style={{ fontSize: "12px", color: "#64748b" }}>
                {previousValue !== undefined ? `Previous: ${previousValue} · ` : ""}
                {timeframe}
            </div>
        </div>
    );
}
