/**
 * StatisticsCard Component
 * Displays a single key statistic with an icon, title, value, and change indicator.
 */
export default function StatisticsCard({
    title,
    value,
    subtitle,
    icon,
    trend, // e.g. "+12.4%", "-3.2%"
    trendType = "positive", // "positive" | "negative" | "neutral"
}) {
    return (
        <div
            style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                padding: "18px 20px",
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
                <span style={{ display: "flex", alignItems: "center" }}>
                    {icon || (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    )}
                </span>
            </div>

            <div style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}>
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
                    {subtitle && (
                        <span style={{ color: "#64748b", fontWeight: 400 }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
