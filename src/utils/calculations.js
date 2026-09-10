// ═══════════════════════════════════════════════
// DataLens — Calculations
// All math/statistics functions for data analysis,
// anomaly detection, projections, and gamification.
// ═══════════════════════════════════════════════

/**
 * Calculate percentage change between two values.
 * @param {number} previous
 * @param {number} current
 * @returns {number} Percentage change (positive = growth, negative = decline)
 */
export function calcPercentChange(previous, current) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Calculate growth percentage (only positive changes).
 */
export function calcGrowth(previous, current) {
    const change = calcPercentChange(previous, current);
    return change > 0 ? change : 0;
}

/**
 * Calculate decline percentage (only negative changes).
 */
export function calcDecline(previous, current) {
    const change = calcPercentChange(previous, current);
    return change < 0 ? Math.abs(change) : 0;
}

/**
 * Calculate sum of numeric values in an array.
 */
export function calcTotal(values) {
    return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

/**
 * Calculate average of numeric values.
 */
export function calcAverage(values) {
    const numericValues = values.filter((v) => !isNaN(parseFloat(v)));
    if (numericValues.length === 0) return 0;
    return calcTotal(numericValues) / numericValues.length;
}

/**
 * Find the highest value and its index.
 */
export function findHighest(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const max = Math.max(...numericValues);
    const index = numericValues.indexOf(max);
    return { value: max, index };
}

/**
 * Find the lowest value and its index.
 */
export function findLowest(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const min = Math.min(...numericValues);
    const index = numericValues.indexOf(min);
    return { value: min, index };
}

/**
 * Calculate median of numeric values.
 */
export function calcMedian(values) {
    const sorted = values
        .map((v) => parseFloat(v) || 0)
        .sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate standard deviation.
 */
export function calcStdDev(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const avg = calcAverage(numericValues);
    const squareDiffs = numericValues.map((v) => Math.pow(v - avg, 2));
    return Math.sqrt(calcAverage(squareDiffs));
}

/**
 * Generate complete statistics for a dataset column.
 */
export function generateStats(values) {
    const numericValues = values.filter((v) => !isNaN(parseFloat(v))).map(Number);

    if (numericValues.length === 0) {
        return {
            total: 0,
            average: 0,
            highest: { value: 0, index: -1 },
            lowest: { value: 0, index: -1 },
            median: 0,
            stdDev: 0,
            count: 0,
            growth: 0,
            decline: 0,
        };
    }

    const highest = findHighest(numericValues);
    const lowest = findLowest(numericValues);

    // Calculate overall growth/decline (first vs last)
    const first = numericValues[0];
    const last = numericValues[numericValues.length - 1];

    return {
        total: calcTotal(numericValues),
        average: calcAverage(numericValues),
        highest,
        lowest,
        median: calcMedian(numericValues),
        stdDev: calcStdDev(numericValues),
        count: numericValues.length,
        growth: calcGrowth(first, last),
        decline: calcDecline(first, last),
        percentChange: calcPercentChange(first, last),
        firstValue: first,
        lastValue: last,
    };
}

/**
 * Detect anomalies using z-score method.
 * Values with z-score > threshold (default 2) are considered anomalies.
 * @returns {Array<{index, value, zScore, type}>}
 */
export function detectAnomalies(values, threshold = 2) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const avg = calcAverage(numericValues);
    const std = calcStdDev(numericValues);

    if (std === 0) return [];

    return numericValues
        .map((value, index) => {
            const zScore = Math.abs((value - avg) / std);
            if (zScore > threshold) {
                return {
                    index,
                    value,
                    zScore: Math.round(zScore * 100) / 100,
                    type: value > avg ? "spike" : "drop",
                    deviation: Math.round(((value - avg) / avg) * 100),
                };
            }
            return null;
        })
        .filter(Boolean);
}

/**
 * Generate sparkline data (normalized 0-1 range for mini charts).
 */
export function generateSparklineData(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const range = max - min || 1;

    return numericValues.map((v) => (v - min) / range);
}

/**
 * Linear regression for trajectory projection.
 * Returns slope, intercept, and projected values.
 */
export function linearRegression(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const n = numericValues.length;

    if (n < 2) return { slope: 0, intercept: numericValues[0] || 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += numericValues[i];
        sumXY += i * numericValues[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² calculation
    const yMean = sumY / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
        const predicted = slope * i + intercept;
        ssRes += Math.pow(numericValues[i] - predicted, 2);
        ssTot += Math.pow(numericValues[i] - yMean, 2);
    }
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return { slope, intercept, r2: Math.round(r2 * 100) / 100 };
}

/**
 * Project future values using linear regression.
 * @param {number[]} values - Existing values
 * @param {number} steps - Number of future steps to project
 */
export function projectTrajectory(values, steps = 3) {
    const { slope, intercept } = linearRegression(values);
    const n = values.length;

    return Array.from({ length: steps }, (_, i) => {
        const projected = slope * (n + i) + intercept;
        return Math.round(projected * 100) / 100;
    });
}

/**
 * What-if simulator: adjusts values by a percentage and projects outcomes.
 * @param {number[]} values - Current values
 * @param {number} adjustPercent - Percentage adjustment (e.g., 10 for +10%)
 * @param {number} targetValue - Target value to reach
 * @returns {{ adjustedValues, projectedValues, monthsToTarget }}
 */
export function whatIfSimulator(values, adjustPercent, targetValue = null) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const lastValue = numericValues[numericValues.length - 1];
    const adjustFactor = 1 + adjustPercent / 100;

    // Simulate adjusted future values
    const adjustedValues = [];
    let current = lastValue;
    for (let i = 0; i < 12; i++) {
        current = current * adjustFactor;
        adjustedValues.push(Math.round(current * 100) / 100);
    }

    // Calculate months to reach target
    let monthsToTarget = null;
    if (targetValue !== null && adjustPercent !== 0) {
        current = lastValue;
        let months = 0;
        const maxMonths = 120; // 10 years max
        while (current < targetValue && months < maxMonths) {
            current = current * adjustFactor;
            months++;
        }
        monthsToTarget = months < maxMonths ? months : null;
    }

    return { adjustedValues, monthsToTarget, startValue: lastValue };
}

/**
 * Calculate period-over-period comparison.
 * @param {number[]} period1 - Values for period 1
 * @param {number[]} period2 - Values for period 2
 */
export function comparePeriods(period1, period2) {
    const avg1 = calcAverage(period1);
    const avg2 = calcAverage(period2);
    const total1 = calcTotal(period1);
    const total2 = calcTotal(period2);

    return {
        avgChange: calcPercentChange(avg1, avg2),
        totalChange: calcPercentChange(total1, total2),
        avg1,
        avg2,
        total1,
        total2,
        pointByPoint: period1.map((v, i) => ({
            period1: parseFloat(v) || 0,
            period2: parseFloat(period2[i]) || 0,
            change: calcPercentChange(parseFloat(v) || 0, parseFloat(period2[i]) || 0),
        })),
    };
}

/**
 * Calculate month-over-month changes for each pair.
 */
export function calcMonthOverMonth(values) {
    const numericValues = values.map((v) => parseFloat(v) || 0);
    const changes = [];

    for (let i = 1; i < numericValues.length; i++) {
        changes.push({
            index: i,
            previous: numericValues[i - 1],
            current: numericValues[i],
            change: calcPercentChange(numericValues[i - 1], numericValues[i]),
            absolute: numericValues[i] - numericValues[i - 1],
        });
    }

    return changes;
}

/**
 * Calculate streak (consecutive days with entries).
 * @param {string[]} dates - Array of ISO date strings
 */
export function calcStreak(dates) {
    if (!dates || dates.length === 0) return { current: 0, longest: 0 };

    const sortedDates = [...dates]
        .map((d) => new Date(d))
        .sort((a, b) => b - a); // newest first

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if the most recent entry is today or yesterday
    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
        currentStreak = 0;
    } else {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            prev.setHours(0, 0, 0, 0);
            curr.setHours(0, 0, 0, 0);

            const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        prev.setHours(0, 0, 0, 0);
        curr.setHours(0, 0, 0, 0);

        const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
}

/**
 * Calculate compliance rate for a checklist.
 * @param {Object[]} checklistItems - Array of {completed: boolean}
 */
export function calcComplianceRate(checklistItems) {
    if (!checklistItems || checklistItems.length === 0) return 0;
    const completed = checklistItems.filter((item) => item.completed).length;
    return Math.round((completed / checklistItems.length) * 100);
}

/**
 * Calculate goal progress.
 * @param {number} currentValue - Current value
 * @param {number} targetValue - Target value
 */
export function calcGoalProgress(currentValue, targetValue) {
    if (targetValue === 0) return 100;
    const progress = Math.min((currentValue / targetValue) * 100, 100);
    return Math.round(progress * 10) / 10;
}

/**
 * Estimate time to reach goal based on current trajectory.
 */
export function estimateTimeToGoal(values, targetValue) {
    const { slope } = linearRegression(values);
    const lastValue = parseFloat(values[values.length - 1]) || 0;

    if (slope <= 0 && targetValue > lastValue) return null; // Never reachable
    if (lastValue >= targetValue) return 0;

    const periodsNeeded = (targetValue - lastValue) / slope;
    return Math.ceil(periodsNeeded);
}
