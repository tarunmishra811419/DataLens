// ═══════════════════════════════════════════════
// DataLens — Formatters
// Display formatting utilities for currency,
// percentages, dates, numbers, and relative time.
// ═══════════════════════════════════════════════

/**
 * Format a number as Indian currency (₹).
 * @param {number|string} value
 * @param {boolean} compact - Use compact notation (e.g., ₹1.5L)
 */
export function formatCurrency(value, compact = false) {
    const num = parseFloat(value);
    if (isNaN(num)) return "₹0";

    if (compact) {
        if (Math.abs(num) >= 10000000) {
            return `₹${(num / 10000000).toFixed(1)}Cr`;
        }
        if (Math.abs(num) >= 100000) {
            return `₹${(num / 100000).toFixed(1)}L`;
        }
        if (Math.abs(num) >= 1000) {
            return `₹${(num / 1000).toFixed(1)}K`;
        }
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Format a number as a percentage.
 * @param {number|string} value
 * @param {number} decimals - Decimal places (default 1)
 */
export function formatPercentage(value, decimals = 1) {
    const num = parseFloat(value);
    if (isNaN(num)) return "0%";
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a date string to locale display.
 * @param {string|Date} date
 * @param {string} format - "short" | "long" | "datetime"
 */
export function formatDate(date, format = "short") {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const options = {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
        datetime: { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
        monthYear: { month: "long", year: "numeric" },
        dayMonth: { day: "numeric", month: "short" },
    };

    return d.toLocaleDateString("en-IN", options[format] || options.short);
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago").
 * @param {string|Date} date
 */
export function formatRelativeTime(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffMs = now - d;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return formatDate(date, "short");
}

/**
 * Format a large number with commas (Indian system).
 * @param {number|string} value
 * @param {boolean} compact - Use compact notation (e.g., 1.5K)
 */
export function formatNumber(value, compact = false) {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    if (compact) {
        if (Math.abs(num) >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
        if (Math.abs(num) >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "…";
}

/**
 * Format a value based on data type.
 * @param {number|string} value
 * @param {string} dataType - "currency" | "number" | "percentage" | "hours" | "count"
 * @param {boolean} compact
 */
export function formatValue(value, dataType = "number", compact = false) {
    switch (dataType) {
        case "currency":
            return formatCurrency(value, compact);
        case "percentage":
            return `${parseFloat(value) || 0}%`;
        case "hours":
            return `${parseFloat(value) || 0} hrs`;
        case "count":
        case "number":
        default:
            return formatNumber(value, compact);
    }
}

/**
 * Format file size in bytes to human readable.
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format a growth/change value with arrow and color info.
 */
export function formatChange(percentChange) {
    const num = parseFloat(percentChange);
    if (isNaN(num) || num === 0) {
        return { text: "No change", arrow: "→", type: "neutral", color: "var(--color-text-tertiary)" };
    }
    if (num > 0) {
        return { text: `+${num.toFixed(1)}%`, arrow: "↑", type: "growth", color: "var(--color-success)" };
    }
    return { text: `${num.toFixed(1)}%`, arrow: "↓", type: "decline", color: "var(--color-danger)" };
}

/**
 * Get category info by value.
 */
export function getCategoryInfo(category) {
    const categories = {
        Finance: { icon: "💰", color: "#10b981" },
        Education: { icon: "📚", color: "#3b82f6" },
        Fitness: { icon: "🏃", color: "#ef4444" },
        Career: { icon: "💼", color: "#f59e0b" },
        Business: { icon: "📊", color: "#8b5cf6" },
        Custom: { icon: "📦", color: "#6366f1" },
    };
    return categories[category] || categories.Custom;
}
