// ═══════════════════════════════════════════════
// DataLens — Constants
// All app-wide constants, categories, templates,
// achievement definitions, and configurations.
// ═══════════════════════════════════════════════

// ─── Dataset Categories ───
export const CATEGORIES = [
    { value: "Finance", label: "Finance", icon: "💰", color: "#10b981" },
    { value: "Education", label: "Education", icon: "📚", color: "#3b82f6" },
    { value: "Fitness", label: "Fitness", icon: "🏃", color: "#ef4444" },
    { value: "Career", label: "Career", icon: "💼", color: "#f59e0b" },
    { value: "Business", label: "Business", icon: "📊", color: "#8b5cf6" },
    { value: "Custom", label: "Custom", icon: "📦", color: "#6366f1" },
];

// ─── Chart Types ───
export const CHART_TYPES = [
    { value: "line", label: "Line Chart", icon: "📈" },
    { value: "bar", label: "Bar Chart", icon: "📊" },
    { value: "area", label: "Area Chart", icon: "📉" },
    { value: "pie", label: "Pie Chart", icon: "🥧" },
    { value: "doughnut", label: "Donut Chart", icon: "🍩" },
];

// ─── Time Periods ───
export const TIME_PERIODS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
    { value: "custom", label: "Custom" },
];

// ─── Data Types ───
export const DATA_TYPES = [
    { value: "currency", label: "Currency (₹)", symbol: "₹" },
    { value: "number", label: "Number", symbol: "" },
    { value: "percentage", label: "Percentage (%)", symbol: "%" },
    { value: "hours", label: "Hours", symbol: "hrs" },
    { value: "count", label: "Count", symbol: "" },
    { value: "custom", label: "Custom", symbol: "" },
];

// ─── Template Presets ───
export const TEMPLATES = [
    {
        id: "monthly-budget",
        name: "Monthly Budget",
        icon: "💰",
        category: "Finance",
        description: "Track income, expenses and savings month by month",
        columns: ["Month", "Income", "Expenses", "Savings"],
        sampleRows: [
            { Month: "January", Income: "25000", Expenses: "18000", Savings: "7000" },
            { Month: "February", Income: "28000", Expenses: "19000", Savings: "9000" },
            { Month: "March", Income: "26000", Expenses: "17000", Savings: "9000" },
        ],
        timePeriod: "monthly",
        dataType: "currency",
    },
    {
        id: "study-tracker",
        name: "Study Tracker",
        icon: "📚",
        category: "Education",
        description: "Log daily study hours and track progress over time",
        columns: ["Date", "Subject", "Hours", "Pages"],
        sampleRows: [
            { Date: "2026-01-01", Subject: "Mathematics", Hours: "3", Pages: "25" },
            { Date: "2026-01-02", Subject: "Physics", Hours: "2.5", Pages: "18" },
            { Date: "2026-01-03", Subject: "Chemistry", Hours: "2", Pages: "20" },
        ],
        timePeriod: "daily",
        dataType: "hours",
    },
    {
        id: "gym-progress",
        name: "Gym Progress",
        icon: "🏋️",
        category: "Fitness",
        description: "Track workouts, weight, reps and personal records",
        columns: ["Date", "Exercise", "Weight (kg)", "Reps", "Sets"],
        sampleRows: [
            { Date: "2026-01-01", Exercise: "Bench Press", "Weight (kg)": "60", Reps: "10", Sets: "3" },
            { Date: "2026-01-02", Exercise: "Squat", "Weight (kg)": "80", Reps: "8", Sets: "4" },
            { Date: "2026-01-03", Exercise: "Deadlift", "Weight (kg)": "100", Reps: "5", Sets: "3" },
        ],
        timePeriod: "daily",
        dataType: "number",
    },
    {
        id: "expense-tracker",
        name: "Expense Tracker",
        icon: "💸",
        category: "Finance",
        description: "Log daily expenses by category",
        columns: ["Date", "Category", "Description", "Amount"],
        sampleRows: [
            { Date: "2026-01-01", Category: "Food", Description: "Lunch", Amount: "150" },
            { Date: "2026-01-01", Category: "Transport", Description: "Metro", Amount: "60" },
            { Date: "2026-01-02", Category: "Shopping", Description: "Books", Amount: "450" },
        ],
        timePeriod: "daily",
        dataType: "currency",
    },
    {
        id: "sip-tracker",
        name: "SIP Tracker",
        icon: "📈",
        category: "Finance",
        description: "Track SIP investments and returns month by month",
        columns: ["Month", "Invested", "Current Value", "Returns"],
        sampleRows: [
            { Month: "January", Invested: "5000", "Current Value": "5100", Returns: "100" },
            { Month: "February", Invested: "10000", "Current Value": "10350", Returns: "350" },
            { Month: "March", Invested: "15000", "Current Value": "15800", Returns: "800" },
        ],
        timePeriod: "monthly",
        dataType: "currency",
    },
    {
        id: "weight-tracker",
        name: "Weight Tracker",
        icon: "⚖️",
        category: "Fitness",
        description: "Track body weight and BMI over time",
        columns: ["Date", "Weight (kg)", "BMI", "Notes"],
        sampleRows: [
            { Date: "2026-01-01", "Weight (kg)": "75", BMI: "24.2", Notes: "" },
            { Date: "2026-01-08", "Weight (kg)": "74.5", BMI: "24.0", Notes: "Started running" },
            { Date: "2026-01-15", "Weight (kg)": "74", BMI: "23.9", Notes: "" },
        ],
        timePeriod: "weekly",
        dataType: "number",
    },
];

// ─── Domain Packs ───
export const DOMAIN_PACKS = [
    {
        id: "student",
        name: "Student Mode",
        icon: "🎓",
        description: "Study hours, mock scores, assignment deadlines",
        templates: ["study-tracker"],
        suggestedCategories: ["Education"],
    },
    {
        id: "finance",
        name: "Finance Mode",
        icon: "💰",
        description: "Budget envelopes, SIP tracker, expense management",
        templates: ["monthly-budget", "expense-tracker", "sip-tracker"],
        suggestedCategories: ["Finance"],
    },
    {
        id: "fitness",
        name: "Fitness Mode",
        icon: "🏋️",
        description: "Workout logs, weight tracking, personal records",
        templates: ["gym-progress", "weight-tracker"],
        suggestedCategories: ["Fitness"],
    },
];

// ─── Achievement / Badge Definitions ───
export const ACHIEVEMENTS = [
    { id: "first-dataset", name: "First Steps", icon: "🌱", description: "Create your first dataset", condition: (stats) => stats.totalDatasets >= 1 },
    { id: "five-datasets", name: "Data Explorer", icon: "🗺️", description: "Create 5 datasets", condition: (stats) => stats.totalDatasets >= 5 },
    { id: "ten-datasets", name: "Data Master", icon: "👑", description: "Create 10 datasets", condition: (stats) => stats.totalDatasets >= 10 },
    { id: "first-entry", name: "Hello Data", icon: "👋", description: "Add your first data entry", condition: (stats) => stats.totalEntries >= 1 },
    { id: "hundred-entries", name: "Century", icon: "💯", description: "Log 100 entries across all datasets", condition: (stats) => stats.totalEntries >= 100 },
    { id: "five-hundred-entries", name: "Data Machine", icon: "⚡", description: "Log 500 entries", condition: (stats) => stats.totalEntries >= 500 },
    { id: "streak-7", name: "Week Warrior", icon: "🔥", description: "Maintain a 7-day logging streak", condition: (stats) => stats.currentStreak >= 7 },
    { id: "streak-30", name: "Monthly Champion", icon: "🏆", description: "Maintain a 30-day logging streak", condition: (stats) => stats.currentStreak >= 30 },
    { id: "streak-100", name: "Unstoppable", icon: "💎", description: "Maintain a 100-day logging streak", condition: (stats) => stats.currentStreak >= 100 },
    { id: "first-compare", name: "Analyst", icon: "🔍", description: "Compare datasets for the first time", condition: (stats) => stats.totalComparisons >= 1 },
    { id: "first-export", name: "Sharer", icon: "📤", description: "Export your first dataset", condition: (stats) => stats.totalExports >= 1 },
    { id: "goal-reached", name: "Goal Crusher", icon: "🎯", description: "Reach your first goal", condition: (stats) => stats.goalsReached >= 1 },
    { id: "growth-20", name: "Rising Star", icon: "⭐", description: "Achieve 20% growth in any dataset", condition: (stats) => stats.maxGrowth >= 20 },
    { id: "all-charts", name: "Visualizer", icon: "🎨", description: "Use all 5 chart types", condition: (stats) => stats.chartTypesUsed >= 5 },
    { id: "dark-mode", name: "Night Owl", icon: "🦉", description: "Switch to dark mode", condition: (stats) => stats.usedDarkMode },
];

// ─── Chart Color Palettes ───
export const CHART_PALETTES = {
    default: ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"],
    ocean: ["#0ea5e9", "#06b6d4", "#22d3ee", "#67e8f9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe"],
    sunset: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ef4444", "#f87171", "#fca5a5", "#fecaca"],
    forest: ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#15803d", "#166534", "#14532d", "#052e16"],
    royal: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065"],
    monochrome: ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9"],
};

// ─── Sort Options ───
export const SORT_OPTIONS = [
    { value: "name-asc", label: "Name (A → Z)" },
    { value: "name-desc", label: "Name (Z → A)" },
    { value: "date-newest", label: "Newest First" },
    { value: "date-oldest", label: "Oldest First" },
    { value: "entries-most", label: "Most Entries" },
    { value: "entries-least", label: "Least Entries" },
    { value: "growth-highest", label: "Highest Growth" },
    { value: "growth-lowest", label: "Lowest Growth" },
];

// ─── Filter Periods ───
export const FILTER_PERIODS = [
    { value: "all", label: "All Time" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" },
    { value: "6m", label: "Last 6 Months" },
    { value: "1y", label: "Last Year" },
];

// ─── Share Expiry Options ───
export const SHARE_EXPIRY_OPTIONS = [
    { value: "1h", label: "1 Hour" },
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "never", label: "Never Expires" },
];

// ─── Nav Items ───
export const NAV_ITEMS = [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/datasets", label: "Datasets", icon: "Database" },
    { path: "/compare", label: "Compare", icon: "GitCompareArrows" },
    { path: "/goals", label: "Goals", icon: "Target" },
    { path: "/profile", label: "Profile", icon: "User" },
];

// ─── API Base URL ───
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
