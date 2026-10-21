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
        high: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", border: "rgba(239, 68, 68, 0.25)" },
        medium: { bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.25)" },
        low: { bg: "rgba(37, 99, 235, 0.12)", text: "#60a5fa", border: "rgba(37, 99, 235, 0.25)" },
    };

    const renderTypeIcon = () => {
        if (icon) return icon;
        switch (type) {
            case "trend":
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                );
            case "anomaly":
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                );
            case "streak":
            case "goal":
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 14 14" />
                    </svg>
                );
            default:
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                );
        }
    };

    const pri = priorityColors[priority] || priorityColors.medium;

    return (
        <div
            style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                padding: "16px 18px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
            }}
        >
            <div
                style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {renderTypeIcon()}
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
                            fontWeight: 600,
                            color: "#f1f5f9",
                        }}
                    >
                        {title || "Analytical Insight"}
                    </h4>

                    {priority && (
                        <span
                            style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "4px",
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
