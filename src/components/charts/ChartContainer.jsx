/**
 * ChartContainer Component
 * Provides a standardized card layout with title, subtitle, and action controls for charts.
 */
export default function ChartContainer({
    title,
    subtitle,
    actions,
    children,
    height = "360px",
    className = "",
    style = {},
}) {
    return (
        <div
            className={`datalens-chart-card ${className}`}
            style={{
                background: "rgba(255, 255, 255, 0.035)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "22px",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
        >
            {(title || subtitle || actions) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "18px",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <div>
                        {title && (
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    color: "#f8fafc",
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                            >
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p
                                style={{
                                    margin: "4px 0 0 0",
                                    fontSize: "12px",
                                    color: "#94a3b8",
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && <div style={{ display: "flex", gap: "8px" }}>{actions}</div>}
                </div>
            )}

            <div style={{ position: "relative", width: "100%", height }}>
                {children}
            </div>
        </div>
    );
}
