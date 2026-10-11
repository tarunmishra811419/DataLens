// ═══════════════════════════════════════════════
// DataLens — Dataset Service
// Manages saving, updating, retrieving, and deleting datasets.
// Operates with persistent LocalStorage and syncs with backend API.
// ═══════════════════════════════════════════════

const STORAGE_KEY = "datalens_saved_datasets";
const API_BASE_URL = "http://localhost:5000/api/datasets";

/**
 * Initial starter datasets provided on first run so the workspace
 * is populated with meaningful data that can be viewed and edited.
 */
const DEFAULT_INITIAL_DATASETS = [
    {
        id: "ds_sample_sales",
        name: "Monthly Sales Performance",
        category: "Sales",
        source: "manual",
        columns: ["Month", "Region", "Revenue ($)", "Units Sold", "Customer Rating"],
        rows: [
            { "Month": "January", "Region": "North", "Revenue ($)": "45200", "Units Sold": "320", "Customer Rating": "4.8" },
            { "Month": "February", "Region": "South", "Revenue ($)": "38900", "Units Sold": "285", "Customer Rating": "4.6" },
            { "Month": "March", "Region": "East", "Revenue ($)": "52400", "Units Sold": "410", "Customer Rating": "4.9" },
            { "Month": "April", "Region": "West", "Revenue ($)": "48100", "Units Sold": "360", "Customer Rating": "4.7" },
            { "Month": "May", "Region": "North", "Revenue ($)": "61000", "Units Sold": "490", "Customer Rating": "4.9" },
            { "Month": "June", "Region": "Central", "Revenue ($)": "55700", "Units Sold": "430", "Customer Rating": "4.8" },
        ],
        rowLabels: ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5", "Row 6"],
        createdAt: "2026-10-01T10:00:00.000Z",
        updatedAt: "2026-10-08T14:30:00.000Z",
    },
    {
        id: "ds_sample_inventory",
        name: "Product Inventory & Stock",
        category: "Operations",
        source: "manual",
        columns: ["Product", "Category", "Price ($)", "Stock", "Reorder Level"],
        rows: [
            { "Product": "Wireless Headphones", "Category": "Audio", "Price ($)": "89.99", "Stock": "142", "Reorder Level": "30" },
            { "Product": "Mechanical Keyboard", "Category": "Accessories", "Price ($)": "129.50", "Stock": "65", "Reorder Level": "25" },
            { "Product": "Ultra HD Monitor 27\"", "Category": "Displays", "Price ($)": "299.00", "Stock": "38", "Reorder Level": "15" },
            { "Product": "Ergonomic Desk Chair", "Category": "Furniture", "Price ($)": "249.99", "Stock": "24", "Reorder Level": "10" },
            { "Product": "USB-C Dual Dock", "Category": "Accessories", "Price ($)": "59.00", "Stock": "210", "Reorder Level": "50" },
        ],
        rowLabels: ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"],
        createdAt: "2026-10-02T11:20:00.000Z",
        updatedAt: "2026-10-07T09:15:00.000Z",
    },
    {
        id: "ds_sample_growth",
        name: "Website Growth Analytics",
        category: "Marketing",
        source: "manual",
        columns: ["Week", "Visitors", "Page Views", "Bounce Rate (%)", "Conversions"],
        rows: [
            { "Week": "Week 1", "Visitors": "12400", "Page Views": "38900", "Bounce Rate (%)": "42.1", "Conversions": "540" },
            { "Week": "Week 2", "Visitors": "14100", "Page Views": "43200", "Bounce Rate (%)": "39.8", "Conversions": "620" },
            { "Week": "Week 3", "Visitors": "16800", "Page Views": "51500", "Bounce Rate (%)": "37.5", "Conversions": "790" },
            { "Week": "Week 4", "Visitors": "19500", "Page Views": "62100", "Bounce Rate (%)": "35.2", "Conversions": "940" },
            { "Week": "Week 5", "Visitors": "22100", "Page Views": "70400", "Bounce Rate (%)": "34.0", "Conversions": "1120" },
        ],
        rowLabels: ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"],
        createdAt: "2026-10-03T16:45:00.000Z",
        updatedAt: "2026-10-06T18:00:00.000Z",
    },
];

/**
 * Get all saved datasets from localStorage (sorted by most recently updated).
 */
export function getSavedDatasets() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Seed initial sample datasets on first check
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_DATASETS));
            return [...DEFAULT_INITIAL_DATASETS];
        }
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            return parsed.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        }
        return [];
    } catch (e) {
        console.error("Failed to read datasets from storage", e);
        return [];
    }
}

/**
 * Retrieve a specific saved dataset by its ID.
 */
export function getSavedDatasetById(id) {
    if (!id) return null;
    const all = getSavedDatasets();
    return all.find((d) => d.id === id || d._id === id) || null;
}

/**
 * Save or update a dataset.
 * If dataset has an existing id, it updates that entry; otherwise creates a new one.
 * Also attempts to sync with backend if online.
 */
export async function saveDataset(datasetData) {
    const {
        id,
        name,
        category = "General",
        columns = [],
        rows = [],
        rowLabels = [],
        source = "manual",
    } = datasetData;

    const cleanName = (name && name.trim()) || "Untitled Dataset";
    const now = new Date().toISOString();

    const existingDatasets = getSavedDatasets();
    let savedItem;

    if (id) {
        // Update existing dataset
        const index = existingDatasets.findIndex((d) => d.id === id || d._id === id);
        if (index !== -1) {
            savedItem = {
                ...existingDatasets[index],
                name: cleanName,
                category,
                columns,
                rows,
                rowLabels: rowLabels.length > 0 ? rowLabels : existingDatasets[index].rowLabels,
                source,
                updatedAt: now,
            };
            existingDatasets[index] = savedItem;
        } else {
            // ID provided but not found; create new with this ID
            savedItem = {
                id,
                name: cleanName,
                category,
                columns,
                rows,
                rowLabels,
                source,
                createdAt: now,
                updatedAt: now,
            };
            existingDatasets.unshift(savedItem);
        }
    } else {
        // Create new dataset
        const newId = `ds_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        savedItem = {
            id: newId,
            name: cleanName,
            category,
            columns,
            rows,
            rowLabels,
            source,
            createdAt: now,
            updatedAt: now,
        };
        existingDatasets.unshift(savedItem);
    }

    // Persist to local storage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDatasets));
        window.dispatchEvent(new CustomEvent("datalens_datasets_updated", { detail: savedItem }));
    } catch (e) {
        console.error("Failed to persist dataset to localStorage", e);
    }

    // Async attempt to sync with backend if authenticated token exists
    try {
        const token = localStorage.getItem("datalens_token") || sessionStorage.getItem("datalens_token");
        if (token && !token.startsWith("demo-")) {
            const endpoint = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;
            const method = id ? "PUT" : "POST";
            fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: cleanName,
                    category,
                    columns,
                    rows,
                    source,
                }),
            }).catch(() => {
                // Background sync failure gracefully ignored in offline/local mode
            });
        }
    } catch {
        // Ignore network errors in local mode
    }

    return savedItem;
}

/**
 * Delete a saved dataset by its ID.
 */
export async function deleteSavedDataset(id) {
    if (!id) return false;
    const existingDatasets = getSavedDatasets();
    const filtered = existingDatasets.filter((d) => d.id !== id && d._id !== id);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent("datalens_datasets_updated", { detail: { id, deleted: true } }));
    } catch (e) {
        console.error("Failed to delete dataset from localStorage", e);
        return false;
    }

    // Async attempt to delete on backend if authenticated
    try {
        const token = localStorage.getItem("datalens_token") || sessionStorage.getItem("datalens_token");
        if (token && !token.startsWith("demo-")) {
            fetch(`${API_BASE_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).catch(() => {});
        }
    } catch {
        // Ignore network errors in local mode
    }

    return true;
}

/**
 * Compute aggregate statistics across all saved datasets.
 */
export function getDatasetStats() {
    const datasets = getSavedDatasets();
    const totalDatasets = datasets.length;
    let totalRows = 0;
    let totalCells = 0;

    datasets.forEach((d) => {
        const rowsCount = Array.isArray(d.rows) ? d.rows.length : 0;
        const colsCount = Array.isArray(d.columns) ? d.columns.length : 0;
        totalRows += rowsCount;
        totalCells += rowsCount * colsCount;
    });

    return {
        totalDatasets,
        totalRows,
        totalCells,
    };
}
