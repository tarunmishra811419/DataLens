/**
 * StatisticsCard Component
 * Displays a single key statistic with an icon, title, value, and change indicator.
 */
export default function StatisticsCard({
    title,
    value,
    subtitle,
    icon = "📊",
    trend, // e.g. "+12.4%", "-3.2%"
    trendType = "positive", // "positive" | "negative" | "neutral"
}) {
    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.035)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "18px 20px",
                backdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                    {title}
                </span>
                <span style={{ fontSize: "18px" }}>{icon}</span>
            </div>

            <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc" }}>
                {value}
            </div>

            {(trend || subtitle) && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                    }}
                >
                    {trend && (
                        <span
                            style={{
                                color:
                                    trendType === "positive"
                                        ? "#34d399"
                                        : trendType === "negative"
                                        ? "#f87171"
                                        : "#94a3b8",
                            }}
                        >
                            {trend}
                        </span>
                    )}
                    {subtitle && <span style={{ color: "#64748b" }}>{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
