// ═══════════════════════════════════════════════
// DataLens — Insight Engine (Rule-Based AI)
// Generates natural language insights from data.
// Zero API cost — pure JavaScript logic.
// ═══════════════════════════════════════════════

import {
    calcPercentChange,
    calcAverage,
    calcTotal,
    findHighest,
    findLowest,
    detectAnomalies,
    calcMonthOverMonth,
    linearRegression,
    estimateTimeToGoal,
    calcStreak,
    generateStats,
} from "./calculations";

// ─── Insight Types ───
const INSIGHT_TYPES = {
    TREND_UP: "trend_up",
    TREND_DOWN: "trend_down",
    TREND_STABLE: "trend_stable",
    ANOMALY_SPIKE: "anomaly_spike",
    ANOMALY_DROP: "anomaly_drop",
    HIGHEST_VALUE: "highest_value",
    LOWEST_VALUE: "lowest_value",
    GROWTH_STRONG: "growth_strong",
    DECLINE_ALERT: "decline_alert",
    STREAK: "streak",
    GOAL_PROGRESS: "goal_progress",
    GOAL_REACHED: "goal_reached",
    COMPARISON: "comparison",
    CONSISTENCY: "consistency",
    MILESTONE: "milestone",
    SUMMARY: "summary",
};

// ─── Icons for each insight type ───
const INSIGHT_ICONS = {
    [INSIGHT_TYPES.TREND_UP]: "📈",
    [INSIGHT_TYPES.TREND_DOWN]: "📉",
    [INSIGHT_TYPES.TREND_STABLE]: "➡️",
    [INSIGHT_TYPES.ANOMALY_SPIKE]: "⚠️",
    [INSIGHT_TYPES.ANOMALY_DROP]: "⚠️",
    [INSIGHT_TYPES.HIGHEST_VALUE]: "🏆",
    [INSIGHT_TYPES.LOWEST_VALUE]: "📊",
    [INSIGHT_TYPES.GROWTH_STRONG]: "🚀",
    [INSIGHT_TYPES.DECLINE_ALERT]: "🔻",
    [INSIGHT_TYPES.STREAK]: "🔥",
    [INSIGHT_TYPES.GOAL_PROGRESS]: "🎯",
    [INSIGHT_TYPES.GOAL_REACHED]: "🎉",
    [INSIGHT_TYPES.COMPARISON]: "🔄",
    [INSIGHT_TYPES.CONSISTENCY]: "✨",
    [INSIGHT_TYPES.MILESTONE]: "⭐",
    [INSIGHT_TYPES.SUMMARY]: "💡",
};

/**
 * Generate all insights for a single dataset.
 * @param {Object} dataset - { name, rows, columns, category, goals, etc. }
 * @param {string} valueColumn - The column name that holds numeric values
 * @param {string} labelColumn - The column name that holds labels (e.g., "Month")
 * @returns {Array<{type, icon, text, priority}>}
 */
export function generateInsights(dataset, valueColumn, labelColumn) {
    const insights = [];

    if (!dataset || !dataset.rows || dataset.rows.length === 0) {
        return [createInsight(INSIGHT_TYPES.SUMMARY, "Add some data to start getting insights!", 0)];
    }

    const values = dataset.rows.map((row) => parseFloat(row[valueColumn]) || 0);
    const labels = dataset.rows.map((row) => row[labelColumn] || `Entry ${dataset.rows.indexOf(row) + 1}`);
    const name = dataset.name || "This dataset";

    if (values.length < 2) {
        insights.push(createInsight(INSIGHT_TYPES.SUMMARY, `${name} has ${values.length} entry. Add more data to unlock trend analysis and insights.`, 1));
        return insights;
    }

    // ─── 1. Overall Trend ───
    const trendInsight = analyzeTrend(values, labels, name);
    if (trendInsight) insights.push(trendInsight);

    // ─── 2. Growth / Decline (first vs last) ───
    const changeInsight = analyzeOverallChange(values, labels, name);
    if (changeInsight) insights.push(changeInsight);

    // ─── 3. Month-over-Month latest change ───
    const momInsight = analyzeLatestChange(values, labels, name);
    if (momInsight) insights.push(momInsight);

    // ─── 4. Highest & Lowest ───
    const extremeInsights = analyzeExtremes(values, labels, name);
    insights.push(...extremeInsights);

    // ─── 5. Anomaly Detection ───
    const anomalyInsights = analyzeAnomalies(values, labels, name);
    insights.push(...anomalyInsights);

    // ─── 6. Consistency Check ───
    const consistencyInsight = analyzeConsistency(values, name);
    if (consistencyInsight) insights.push(consistencyInsight);

    // ─── 7. Milestone Detection ───
    const milestoneInsights = analyzeMilestones(values, labels, name);
    insights.push(...milestoneInsights);

    // ─── 8. Goal Progress ───
    if (dataset.goals && dataset.goals.target) {
        const goalInsights = analyzeGoalProgress(values, dataset.goals, name);
        insights.push(...goalInsights);
    }

    // ─── 9. Summary Stat ───
    const summaryInsight = generateSummary(values, name);
    if (summaryInsight) insights.push(summaryInsight);

    // Sort by priority (higher = more important)
    return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate insights for comparing two datasets.
 */
export function generateComparisonInsights(dataset1, dataset2, valueCol1, valueCol2) {
    const insights = [];
    const values1 = dataset1.rows.map((r) => parseFloat(r[valueCol1]) || 0);
    const values2 = dataset2.rows.map((r) => parseFloat(r[valueCol2]) || 0);
    const name1 = dataset1.name;
    const name2 = dataset2.name;

    const avg1 = calcAverage(values1);
    const avg2 = calcAverage(values2);
    const total1 = calcTotal(values1);
    const total2 = calcTotal(values2);

    // Average comparison
    const avgChange = calcPercentChange(avg1, avg2);
    if (Math.abs(avgChange) > 1) {
        const direction = avgChange > 0 ? "higher" : "lower";
        insights.push(createInsight(
            INSIGHT_TYPES.COMPARISON,
            `${name2} has a ${Math.abs(avgChange).toFixed(1)}% ${direction} average than ${name1}.`,
            7
        ));
    }

    // Total comparison
    const totalChange = calcPercentChange(total1, total2);
    if (Math.abs(totalChange) > 5) {
        insights.push(createInsight(
            INSIGHT_TYPES.COMPARISON,
            `Total of ${name2} is ${Math.abs(totalChange).toFixed(1)}% ${totalChange > 0 ? "more" : "less"} than ${name1}.`,
            6
        ));
    }

    // Growth rate comparison
    const stats1 = generateStats(values1);
    const stats2 = generateStats(values2);

    if (stats1.percentChange !== 0 && stats2.percentChange !== 0) {
        const faster = stats2.percentChange > stats1.percentChange ? name2 : name1;
        insights.push(createInsight(
            INSIGHT_TYPES.COMPARISON,
            `${faster} is growing faster with ${Math.abs(faster === name2 ? stats2.percentChange : stats1.percentChange).toFixed(1)}% change over the period.`,
            5
        ));
    }

    return insights;
}

/**
 * Generate insights for period-over-period comparison.
 */
export function generatePeriodInsights(period1Values, period2Values, period1Label, period2Label) {
    const insights = [];
    const avg1 = calcAverage(period1Values);
    const avg2 = calcAverage(period2Values);
    const avgChange = calcPercentChange(avg1, avg2);

    if (Math.abs(avgChange) > 1) {
        const direction = avgChange > 0 ? "increased" : "decreased";
        insights.push(createInsight(
            INSIGHT_TYPES.COMPARISON,
            `Your average value ${direction} by ${Math.abs(avgChange).toFixed(1)}% in ${period2Label} compared with ${period1Label}.`,
            8
        ));
    } else {
        insights.push(createInsight(
            INSIGHT_TYPES.TREND_STABLE,
            `Performance remained stable between ${period1Label} and ${period2Label}.`,
            4
        ));
    }

    // Check which period had more entries
    if (period2Values.length > period1Values.length) {
        insights.push(createInsight(
            INSIGHT_TYPES.CONSISTENCY,
            `You logged ${period2Values.length - period1Values.length} more entries in ${period2Label} — great consistency!`,
            5
        ));
    }

    return insights;
}

/**
 * Generate streak-based insights.
 */
export function generateStreakInsights(dates, userName) {
    const insights = [];
    const { current, longest } = calcStreak(dates);

    if (current >= 7) {
        insights.push(createInsight(
            INSIGHT_TYPES.STREAK,
            `${current}-day streak! ${current >= 30 ? "You're on fire — legendary consistency!" : "Keep it going!"}`,
            current >= 30 ? 9 : 7
        ));
    } else if (current >= 3) {
        insights.push(createInsight(
            INSIGHT_TYPES.STREAK,
            `${current}-day streak — building a great habit!`,
            5
        ));
    } else if (current === 0 && longest > 0) {
        insights.push(createInsight(
            INSIGHT_TYPES.STREAK,
            `Your streak ended. Your best was ${longest} days — let's beat that!`,
            6
        ));
    }

    return insights;
}


// ═══════════════════════════════════════════════
// Internal Analysis Functions
// ═══════════════════════════════════════════════

function analyzeTrend(values, labels, name) {
    const { slope, r2 } = linearRegression(values);
    const avg = calcAverage(values);
    const slopePercent = avg !== 0 ? (slope / avg) * 100 : 0;

    if (Math.abs(slopePercent) < 1 || r2 < 0.3) {
        return createInsight(
            INSIGHT_TYPES.TREND_STABLE,
            `${name} has remained relatively stable over the recorded period.`,
            3
        );
    }

    if (slope > 0) {
        if (r2 > 0.7) {
            return createInsight(
                INSIGHT_TYPES.TREND_UP,
                `${name} shows a strong upward trend — values are steadily increasing from ${labels[0]} to ${labels[labels.length - 1]}.`,
                8
            );
        }
        return createInsight(
            INSIGHT_TYPES.TREND_UP,
            `${name} is generally trending upward, though with some fluctuations.`,
            6
        );
    } else {
        if (r2 > 0.7) {
            return createInsight(
                INSIGHT_TYPES.TREND_DOWN,
                `${name} shows a consistent downward trend from ${labels[0]} to ${labels[labels.length - 1]}.`,
                8
            );
        }
        return createInsight(
            INSIGHT_TYPES.TREND_DOWN,
            `${name} is generally declining, though with some fluctuations.`,
            6
        );
    }
}

function analyzeOverallChange(values, labels, name) {
    const first = values[0];
    const last = values[values.length - 1];
    const change = calcPercentChange(first, last);

    if (Math.abs(change) < 1) return null;

    if (change > 20) {
        return createInsight(
            INSIGHT_TYPES.GROWTH_STRONG,
            `Impressive! ${name} grew by ${change.toFixed(1)}% from ${labels[0]} to ${labels[labels.length - 1]}.`,
            9
        );
    } else if (change > 0) {
        return createInsight(
            INSIGHT_TYPES.TREND_UP,
            `${name} increased by ${change.toFixed(1)}% over the recorded period.`,
            5
        );
    } else if (change < -20) {
        return createInsight(
            INSIGHT_TYPES.DECLINE_ALERT,
            `Alert: ${name} has declined by ${Math.abs(change).toFixed(1)}% from ${labels[0]} to ${labels[labels.length - 1]}.`,
            9
        );
    } else {
        return createInsight(
            INSIGHT_TYPES.TREND_DOWN,
            `${name} decreased by ${Math.abs(change).toFixed(1)}% over the recorded period.`,
            5
        );
    }
}

function analyzeLatestChange(values, labels, name) {
    if (values.length < 2) return null;

    const prev = values[values.length - 2];
    const curr = values[values.length - 1];
    const change = calcPercentChange(prev, curr);
    const prevLabel = labels[labels.length - 2];
    const currLabel = labels[labels.length - 1];

    if (Math.abs(change) < 0.5) return null;

    if (change > 0) {
        return createInsight(
            INSIGHT_TYPES.TREND_UP,
            `Latest update: ${name} increased by ${change.toFixed(1)}% from ${prevLabel} to ${currLabel}.`,
            7
        );
    } else {
        return createInsight(
            INSIGHT_TYPES.TREND_DOWN,
            `Latest update: ${name} decreased by ${Math.abs(change).toFixed(1)}% from ${prevLabel} to ${currLabel}.`,
            7
        );
    }
}

function analyzeExtremes(values, labels, name) {
    const insights = [];
    const highest = findHighest(values);
    const lowest = findLowest(values);

    if (highest.index === values.length - 1) {
        insights.push(createInsight(
            INSIGHT_TYPES.HIGHEST_VALUE,
            `${labels[highest.index]} recorded the highest value ever for ${name} — you're at your peak!`,
            7
        ));
    } else {
        insights.push(createInsight(
            INSIGHT_TYPES.HIGHEST_VALUE,
            `The highest value for ${name} was recorded in ${labels[highest.index]}.`,
            3
        ));
    }

    if (lowest.index === values.length - 1 && values.length > 2) {
        insights.push(createInsight(
            INSIGHT_TYPES.LOWEST_VALUE,
            `${labels[lowest.index]} recorded the lowest value for ${name}. Time to course-correct?`,
            6
        ));
    }

    return insights;
}

function analyzeAnomalies(values, labels, name) {
    const anomalies = detectAnomalies(values);
    return anomalies.map((a) => {
        const label = labels[a.index] || `Entry ${a.index + 1}`;
        if (a.type === "spike") {
            return createInsight(
                INSIGHT_TYPES.ANOMALY_SPIKE,
                `Unusual spike detected in ${label} — value was ${Math.abs(a.deviation)}% above average.`,
                8
            );
        } else {
            return createInsight(
                INSIGHT_TYPES.ANOMALY_DROP,
                `Sudden drop detected in ${label} — value was ${Math.abs(a.deviation)}% below average.`,
                8
            );
        }
    });
}

function analyzeConsistency(values, name) {
    const avg = calcAverage(values);
    if (avg === 0) return null;

    const deviations = values.map((v) => Math.abs((v - avg) / avg) * 100);
    const avgDeviation = calcAverage(deviations);

    if (avgDeviation < 5) {
        return createInsight(
            INSIGHT_TYPES.CONSISTENCY,
            `${name} is remarkably consistent — values barely fluctuate. Great stability!`,
            5
        );
    } else if (avgDeviation > 30) {
        return createInsight(
            INSIGHT_TYPES.CONSISTENCY,
            `${name} has high variability — values swing significantly between entries.`,
            4
        );
    }

    return null;
}

function analyzeMilestones(values, labels, name) {
    const insights = [];
    const total = calcTotal(values);
    const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];

    for (const milestone of milestones) {
        if (total >= milestone && total < milestone * 2) {
            insights.push(createInsight(
                INSIGHT_TYPES.MILESTONE,
                `Milestone: ${name} total has crossed ${formatMilestone(milestone)}!`,
                6
            ));
            break;
        }
    }

    // Entry count milestones
    const count = values.length;
    const entryMilestones = [10, 25, 50, 100, 250, 500];
    for (const m of entryMilestones) {
        if (count === m) {
            insights.push(createInsight(
                INSIGHT_TYPES.MILESTONE,
                `You've logged ${m} entries in ${name} — impressive dedication!`,
                6
            ));
            break;
        }
    }

    return insights;
}

function analyzeGoalProgress(values, goals, name) {
    const insights = [];
    const lastValue = values[values.length - 1];
    const target = goals.target;
    const progress = Math.min((lastValue / target) * 100, 100);

    if (progress >= 100) {
        insights.push(createInsight(
            INSIGHT_TYPES.GOAL_REACHED,
            `Congratulations! You've reached your goal for ${name}! 🎉`,
            10
        ));
    } else if (progress >= 80) {
        insights.push(createInsight(
            INSIGHT_TYPES.GOAL_PROGRESS,
            `Almost there! ${name} is at ${progress.toFixed(0)}% of your goal. Just a little more!`,
            8
        ));
    } else if (progress >= 50) {
        insights.push(createInsight(
            INSIGHT_TYPES.GOAL_PROGRESS,
            `Halfway! ${name} is at ${progress.toFixed(0)}% of your target. Keep pushing!`,
            6
        ));
    } else {
        const eta = estimateTimeToGoal(values, target);
        const etaText = eta ? ` At this rate, you'll reach your goal in ~${eta} periods.` : "";
        insights.push(createInsight(
            INSIGHT_TYPES.GOAL_PROGRESS,
            `${name} is at ${progress.toFixed(0)}% of your goal.${etaText}`,
            4
        ));
    }

    return insights;
}

function generateSummary(values, name) {
    const stats = generateStats(values);
    const trend = stats.percentChange > 0 ? "growing" : stats.percentChange < 0 ? "declining" : "stable";

    return createInsight(
        INSIGHT_TYPES.SUMMARY,
        `${name}: ${stats.count} entries, average of ${formatSmartNumber(stats.average)}, currently ${trend} (${stats.percentChange > 0 ? "+" : ""}${stats.percentChange.toFixed(1)}%).`,
        2
    );
}


// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

function createInsight(type, text, priority) {
    return {
        type,
        icon: INSIGHT_ICONS[type] || "💡",
        text,
        priority,
        timestamp: new Date().toISOString(),
    };
}

function formatMilestone(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return String(value);
}

function formatSmartNumber(value) {
    if (Math.abs(value) >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(1);
}

export { INSIGHT_TYPES, INSIGHT_ICONS };
