/**
 * InsightCard Component
 * Displays rule-based AI generated insights with priority badges and action tags.
 */
export default function InsightCard({
    type = "trend",
    title,
    message,
    priority = "medium", // "high" | "medium" | "low"
    icon,
    timestamp,
}) {
    const priorityColors = {
        high: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
        medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
        low: { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", border: "rgba(99, 102, 241, 0.3)" },
    };

    const defaultIcons = {
        trend: "📈",
        anomaly: "⚠️",
        streak: "🔥",
        goal: "🎯",
        general: "💡",
    };

    const pri = priorityColors[priority] || priorityColors.medium;
    const displayIcon = icon || defaultIcons[type] || "✦";

    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.035)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "18px 20px",
                backdropFilter: "blur(10px)",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
            }}
        >
            <div
                style={{
                    fontSize: "22px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {displayIcon}
            </div>

            <div style={{ flex: 1 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                    }}
                >
                    <h4
                        style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#f1f5f9",
                        }}
                    >
                        {title || "Insight"}
                    </h4>

                    {priority && (
                        <span
                            style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: pri.bg,
                                color: pri.text,
                                border: `1px solid ${pri.border}`,
                            }}
                        >
                            {priority}
                        </span>
                    )}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#94a3b8",
                        lineHeight: 1.5,
                    }}
                >
                    {message}
                </p>

                {timestamp && (
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                        {timestamp}
                    </div>
                )}
            </div>
        </div>
    );
}
