// ═══════════════════════════════════════════════
// DataLens — IndexedDB Utility
// Local-only mode: store datasets entirely in the
// browser with no server sync. Uses IndexedDB.
// ═══════════════════════════════════════════════

const DB_NAME = "DataLensLocal";
const DB_VERSION = 1;
const STORE_DATASETS = "datasets";
const STORE_SETTINGS = "settings";

/**
 * Open (or create) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Datasets store
            if (!db.objectStoreNames.contains(STORE_DATASETS)) {
                const store = db.createObjectStore(STORE_DATASETS, { keyPath: "id" });
                store.createIndex("name", "name", { unique: false });
                store.createIndex("category", "category", { unique: false });
                store.createIndex("updatedAt", "updatedAt", { unique: false });
            }

            // Settings store (for local preferences)
            if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generate a unique ID for local datasets.
 */
function generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ═══════════════════════════════════════════════
// Dataset CRUD Operations
// ═══════════════════════════════════════════════

/**
 * Save a dataset to IndexedDB.
 * @param {Object} dataset - Dataset object
 * @returns {Promise<Object>} Saved dataset with ID
 */
export async function saveLocalDataset(dataset) {
    const db = await openDB();
    const now = new Date().toISOString();

    const datasetToSave = {
        ...dataset,
        id: dataset.id || generateLocalId(),
        isLocalOnly: true,
        createdAt: dataset.createdAt || now,
        updatedAt: now,
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DATASETS, "readwrite");
        const store = transaction.objectStore(STORE_DATASETS);
        const request = store.put(datasetToSave);

        request.onsuccess = () => resolve(datasetToSave);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

/**
 * Get all local datasets.
 * @returns {Promise<Object[]>}
 */
export async function getLocalDatasets() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DATASETS, "readonly");
        const store = transaction.objectStore(STORE_DATASETS);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by updatedAt (newest first)
            const datasets = request.result.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            resolve(datasets);
        };
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

/**
 * Get a single local dataset by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getLocalDatasetById(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DATASETS, "readonly");
        const store = transaction.objectStore(STORE_DATASETS);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

/**
 * Update a local dataset.
 * @param {string} id - Dataset ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateLocalDataset(id, updates) {
    const existing = await getLocalDatasetById(id);
    if (!existing) throw new Error("Local dataset not found");

    const updated = {
        ...existing,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
    };

    return saveLocalDataset(updated);
}

/**
 * Delete a local dataset.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteLocalDataset(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DATASETS, "readwrite");
        const store = transaction.objectStore(STORE_DATASETS);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

// ═══════════════════════════════════════════════
// Row Operations (within a dataset)
// ═══════════════════════════════════════════════

/**
 * Add a row to a local dataset.
 */
export async function addLocalRow(datasetId, row) {
    const dataset = await getLocalDatasetById(datasetId);
    if (!dataset) throw new Error("Local dataset not found");

    const updatedRows = [...(dataset.rows || []), row];
    return updateLocalDataset(datasetId, { rows: updatedRows });
}

/**
 * Update a row in a local dataset.
 */
export async function updateLocalRow(datasetId, rowIndex, updatedRow) {
    const dataset = await getLocalDatasetById(datasetId);
    if (!dataset) throw new Error("Local dataset not found");

    const rows = [...(dataset.rows || [])];
    if (rowIndex < 0 || rowIndex >= rows.length) throw new Error("Row index out of bounds");

    rows[rowIndex] = updatedRow;
    return updateLocalDataset(datasetId, { rows });
}

/**
 * Delete a row from a local dataset.
 */
export async function deleteLocalRow(datasetId, rowIndex) {
    const dataset = await getLocalDatasetById(datasetId);
    if (!dataset) throw new Error("Local dataset not found");

    const rows = (dataset.rows || []).filter((_, i) => i !== rowIndex);
    return updateLocalDataset(datasetId, { rows });
}

// ═══════════════════════════════════════════════
// Bulk & Export Operations
// ═══════════════════════════════════════════════

/**
 * Export all local datasets as a JSON blob (for "Download all my data").
 * @returns {Promise<Blob>}
 */
export async function exportAllLocalData() {
    const datasets = await getLocalDatasets();
    const exportData = {
        exportedAt: new Date().toISOString(),
        source: "DataLens Local Storage",
        datasetCount: datasets.length,
        datasets,
    };

    return new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
}

/**
 * Import datasets from a JSON file into IndexedDB.
 * @param {Object} importData - Parsed JSON with datasets array
 * @returns {Promise<number>} Number of datasets imported
 */
export async function importLocalData(importData) {
    if (!importData || !importData.datasets || !Array.isArray(importData.datasets)) {
        throw new Error("Invalid import file format");
    }

    let imported = 0;
    for (const dataset of importData.datasets) {
        await saveLocalDataset({
            ...dataset,
            id: generateLocalId(), // New ID to avoid conflicts
            isLocalOnly: true,
        });
        imported++;
    }

    return imported;
}

/**
 * Clear all local data (for data retention / account deletion).
 * @returns {Promise<void>}
 */
export async function clearAllLocalData() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DATASETS, "readwrite");
        const store = transaction.objectStore(STORE_DATASETS);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

// ═══════════════════════════════════════════════
// Settings (Local Preferences)
// ═══════════════════════════════════════════════

/**
 * Save a setting to IndexedDB.
 */
export async function saveSetting(key, value) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_SETTINGS, "readwrite");
        const store = transaction.objectStore(STORE_SETTINGS);
        const request = store.put({ key, value });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

/**
 * Get a setting from IndexedDB.
 */
export async function getSetting(key, defaultValue = null) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_SETTINGS, "readonly");
        const store = transaction.objectStore(STORE_SETTINGS);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result ? request.result.value : defaultValue);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
    });
}

/**
 * Get total storage used by DataLens in IndexedDB (approximate).
 * @returns {Promise<{used: number, formatted: string}>}
 */
export async function getStorageUsage() {
    try {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage || 0,
                total: estimate.quota || 0,
                formatted: formatBytes(estimate.usage || 0),
            };
        }
    } catch {
        // Storage API not available
    }

    return { used: 0, total: 0, formatted: "Unknown" };
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
