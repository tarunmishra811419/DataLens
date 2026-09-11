// ═══════════════════════════════════════════════
// DataLens — Gamification System
// Achievements, streaks, badges, levels, and
// progress rings to keep users engaged.
// ═══════════════════════════════════════════════

import { ACHIEVEMENTS } from "./constants";
import { calcStreak } from "./calculations";

// ─── Level System ───
const LEVELS = [
    { level: 1, name: "Beginner", minXP: 0, icon: "🌱" },
    { level: 2, name: "Explorer", minXP: 100, icon: "🗺️" },
    { level: 3, name: "Analyst", minXP: 300, icon: "📊" },
    { level: 4, name: "Strategist", minXP: 600, icon: "🧠" },
    { level: 5, name: "Expert", minXP: 1000, icon: "⭐" },
    { level: 6, name: "Master", minXP: 1800, icon: "👑" },
    { level: 7, name: "Legend", minXP: 3000, icon: "💎" },
    { level: 8, name: "Mythic", minXP: 5000, icon: "🔥" },
];

// ─── XP Rewards ───
const XP_VALUES = {
    createDataset: 20,
    addEntry: 5,
    dailyLogin: 10,
    streakDay: 3,     // per day in streak
    comparison: 15,
    export: 10,
    reachGoal: 50,
    achievement: 30,
};

/**
 * Calculate total XP from user stats.
 * @param {Object} stats - User statistics
 * @returns {number} Total XP
 */
export function calculateXP(stats) {
    let xp = 0;

    xp += (stats.totalDatasets || 0) * XP_VALUES.createDataset;
    xp += (stats.totalEntries || 0) * XP_VALUES.addEntry;
    xp += (stats.currentStreak || 0) * XP_VALUES.streakDay;
    xp += (stats.totalComparisons || 0) * XP_VALUES.comparison;
    xp += (stats.totalExports || 0) * XP_VALUES.export;
    xp += (stats.goalsReached || 0) * XP_VALUES.reachGoal;
    xp += (stats.achievementsEarned || 0) * XP_VALUES.achievement;

    return xp;
}

/**
 * Get the user's current level based on XP.
 * @param {number} xp - Total XP
 * @returns {{ level, name, icon, currentXP, nextLevelXP, progress }}
 */
export function getLevel(xp) {
    let currentLevel = LEVELS[0];

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            currentLevel = LEVELS[i];
            break;
        }
    }

    // Find next level
    const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

    const progress = nextLevel
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

    return {
        ...currentLevel,
        currentXP: xp,
        nextLevelXP: nextLevel ? nextLevel.minXP : currentLevel.minXP,
        nextLevelName: nextLevel ? nextLevel.name : null,
        progress: Math.min(Math.round(progress), 100),
    };
}

/**
 * Check which achievements a user has earned.
 * @param {Object} stats - User statistics
 * @returns {{ earned: Object[], locked: Object[], newlyEarned: Object[] }}
 */
export function checkAchievements(stats, previouslyEarned = []) {
    const earned = [];
    const locked = [];
    const newlyEarned = [];

    ACHIEVEMENTS.forEach((achievement) => {
        const isEarned = achievement.condition(stats);
        const wasEarned = previouslyEarned.includes(achievement.id);

        if (isEarned) {
            earned.push({
                ...achievement,
                earnedAt: wasEarned ? null : new Date().toISOString(),
            });

            if (!wasEarned) {
                newlyEarned.push(achievement);
            }
        } else {
            // Calculate progress toward this achievement
            const progress = getAchievementProgress(achievement, stats);
            locked.push({ ...achievement, progress });
        }
    });

    return { earned, locked, newlyEarned };
}

/**
 * Calculate progress toward a specific achievement.
 */
function getAchievementProgress(achievement, stats) {
    const progressMap = {
        "first-dataset": { current: stats.totalDatasets, target: 1 },
        "five-datasets": { current: stats.totalDatasets, target: 5 },
        "ten-datasets": { current: stats.totalDatasets, target: 10 },
        "first-entry": { current: stats.totalEntries, target: 1 },
        "hundred-entries": { current: stats.totalEntries, target: 100 },
        "five-hundred-entries": { current: stats.totalEntries, target: 500 },
        "streak-7": { current: stats.currentStreak, target: 7 },
        "streak-30": { current: stats.currentStreak, target: 30 },
        "streak-100": { current: stats.currentStreak, target: 100 },
        "first-compare": { current: stats.totalComparisons, target: 1 },
        "first-export": { current: stats.totalExports, target: 1 },
        "goal-reached": { current: stats.goalsReached, target: 1 },
        "growth-20": { current: stats.maxGrowth, target: 20 },
        "all-charts": { current: stats.chartTypesUsed, target: 5 },
    };

    const info = progressMap[achievement.id];
    if (!info) return 0;

    return Math.min(Math.round((info.current / info.target) * 100), 100);
}

/**
 * Get badges (simplified achievement display).
 * @param {string[]} earnedIds - Array of earned achievement IDs
 * @returns {Object[]} Badge objects with name and icon
 */
export function getBadges(earnedIds = []) {
    return ACHIEVEMENTS
        .filter((a) => earnedIds.includes(a.id))
        .map((a) => ({
            id: a.id,
            name: a.name,
            icon: a.icon,
            description: a.description,
        }));
}

/**
 * Generate progress ring data for display.
 * @param {Object} stats
 * @returns {Object[]} Array of { label, value, max, percent, color }
 */
export function getProgressRings(stats) {
    const rings = [];

    // Datasets ring
    rings.push({
        label: "Datasets",
        value: stats.totalDatasets || 0,
        max: 10,
        percent: Math.min(((stats.totalDatasets || 0) / 10) * 100, 100),
        color: "#6366f1",
    });

    // Entries ring
    rings.push({
        label: "Entries",
        value: stats.totalEntries || 0,
        max: 100,
        percent: Math.min(((stats.totalEntries || 0) / 100) * 100, 100),
        color: "#10b981",
    });

    // Streak ring
    rings.push({
        label: "Streak",
        value: stats.currentStreak || 0,
        max: 30,
        percent: Math.min(((stats.currentStreak || 0) / 30) * 100, 100),
        color: "#f59e0b",
    });

    // Goals ring
    if (stats.totalGoals > 0) {
        rings.push({
            label: "Goals",
            value: stats.goalsReached || 0,
            max: stats.totalGoals,
            percent: Math.min(((stats.goalsReached || 0) / stats.totalGoals) * 100, 100),
            color: "#ef4444",
        });
    }

    return rings;
}

/**
 * Build complete user stats from datasets.
 * @param {Object[]} datasets - All user datasets
 * @param {Object} userMeta - Extra metadata { comparisons, exports, chartTypes, dates }
 * @returns {Object} Complete stats object
 */
export function buildUserStats(datasets, userMeta = {}) {
    const totalDatasets = datasets.length;
    const totalEntries = datasets.reduce(
        (sum, ds) => sum + (ds.rows ? ds.rows.length : 0),
        0
    );

    // Calculate max growth across all datasets
    let maxGrowth = 0;
    datasets.forEach((ds) => {
        if (ds.rows && ds.rows.length >= 2) {
            const numericCols = Object.keys(ds.rows[0] || {}).filter((key) => {
                const vals = ds.rows.map((r) => r[key]);
                return vals.some((v) => !isNaN(parseFloat(v)));
            });

            numericCols.forEach((col) => {
                const first = parseFloat(ds.rows[0][col]);
                const last = parseFloat(ds.rows[ds.rows.length - 1][col]);
                if (!isNaN(first) && !isNaN(last) && first > 0) {
                    const growth = ((last - first) / first) * 100;
                    if (growth > maxGrowth) maxGrowth = growth;
                }
            });
        }
    });

    // Streak from entry dates
    const allDates = [];
    datasets.forEach((ds) => {
        if (ds.rows) {
            ds.rows.forEach((row) => {
                // Look for date-like columns
                Object.values(row).forEach((val) => {
                    const d = new Date(val);
                    if (!isNaN(d.getTime()) && String(val).length > 4) {
                        allDates.push(val);
                    }
                });
            });
        }
        // Also use dataset updatedAt
        if (ds.updatedAt) allDates.push(ds.updatedAt);
    });

    const streak = calcStreak(allDates);

    return {
        totalDatasets,
        totalEntries,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        maxGrowth: Math.round(maxGrowth * 10) / 10,
        totalComparisons: userMeta.comparisons || 0,
        totalExports: userMeta.exports || 0,
        chartTypesUsed: userMeta.chartTypes ? userMeta.chartTypes.length : 0,
        goalsReached: userMeta.goalsReached || 0,
        totalGoals: userMeta.totalGoals || 0,
        usedDarkMode: userMeta.usedDarkMode || false,
        achievementsEarned: userMeta.achievementsEarned || 0,
    };
}

export { LEVELS, XP_VALUES };
