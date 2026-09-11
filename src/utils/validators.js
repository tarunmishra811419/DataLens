// ═══════════════════════════════════════════════
// DataLens — Validators
// Input validation functions for auth forms,
// dataset creation, data entry, and settings.
// ═══════════════════════════════════════════════

/**
 * Validate an email address.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email) {
    if (!email || !email.trim()) {
        return { valid: false, message: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return { valid: false, message: "Please enter a valid email address" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a password with strength feedback.
 * @param {string} password
 * @returns {{ valid: boolean, message: string, strength: "weak"|"fair"|"strong" }}
 */
export function validatePassword(password) {
    if (!password) {
        return { valid: false, message: "Password is required", strength: "weak" };
    }

    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters", strength: "weak" };
    }

    // Calculate strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let strength = "weak";
    if (score >= 4) strength = "strong";
    else if (score >= 2) strength = "fair";

    return { valid: true, message: "", strength };
}

/**
 * Validate that two passwords match (for registration / reset).
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordMatch(password, confirmPassword) {
    if (!confirmPassword) {
        return { valid: false, message: "Please confirm your password" };
    }

    if (password !== confirmPassword) {
        return { valid: false, message: "Passwords do not match" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a user's display name.
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validateName(name) {
    if (!name || !name.trim()) {
        return { valid: false, message: "Name is required" };
    }

    if (name.trim().length < 2) {
        return { valid: false, message: "Name must be at least 2 characters" };
    }

    if (name.trim().length > 50) {
        return { valid: false, message: "Name must be under 50 characters" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a dataset name.
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validateDatasetName(name) {
    if (!name || !name.trim()) {
        return { valid: false, message: "Dataset name is required" };
    }

    if (name.trim().length < 2) {
        return { valid: false, message: "Name must be at least 2 characters" };
    }

    if (name.trim().length > 100) {
        return { valid: false, message: "Name must be under 100 characters" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a column name.
 * @param {string} name
 * @param {string[]} existingColumns - Already used column names
 * @returns {{ valid: boolean, message: string }}
 */
export function validateColumnName(name, existingColumns = []) {
    if (!name || !name.trim()) {
        return { valid: false, message: "Column name cannot be empty" };
    }

    if (name.trim().length > 50) {
        return { valid: false, message: "Column name must be under 50 characters" };
    }

    const isDuplicate = existingColumns.some(
        (col) => col.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
        return { valid: false, message: "Column name already exists" };
    }

    return { valid: true, message: "" };
}

/**
 * Check if a value is numeric (can be parsed as a number).
 * @param {*} value
 * @returns {boolean}
 */
export function isNumeric(value) {
    if (value === null || value === undefined || value === "") return false;
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate a single data row against the column schema.
 * @param {Object} row - Row data object { columnName: value }
 * @param {string[]} columns - Expected column names
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRow(row, columns) {
    const errors = [];

    if (!row || typeof row !== "object") {
        return { valid: false, errors: ["Invalid row data"] };
    }

    // Check that every column key exists in the row
    columns.forEach((col) => {
        if (!(col in row)) {
            errors.push(`Missing value for column "${col}"`);
        }
    });

    return { valid: errors.length === 0, errors };
}

/**
 * Validate that at least one row has data.
 * @param {Object[]} rows
 * @param {string[]} columns
 * @returns {{ valid: boolean, message: string }}
 */
export function validateHasData(rows, columns) {
    if (!rows || rows.length === 0) {
        return { valid: false, message: "Please add at least one row of data" };
    }

    const hasAnyValue = rows.some((row) =>
        columns.some((col) => String(row[col] ?? "").trim() !== "")
    );

    if (!hasAnyValue) {
        return { valid: false, message: "Please enter at least one value" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a goal target value.
 * @param {*} value
 * @returns {{ valid: boolean, message: string }}
 */
export function validateGoalTarget(value) {
    if (value === null || value === undefined || value === "") {
        return { valid: false, message: "Target value is required" };
    }

    if (!isNumeric(value)) {
        return { valid: false, message: "Target must be a number" };
    }

    if (parseFloat(value) <= 0) {
        return { valid: false, message: "Target must be greater than zero" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate a file for upload (CSV/Excel).
 * @param {File} file
 * @returns {{ valid: boolean, message: string }}
 */
export function validateFile(file) {
    if (!file) {
        return { valid: false, message: "Please select a file" };
    }

    const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const extension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        return { valid: false, message: "Only CSV and Excel files are supported" };
    }

    // Max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, message: "File size must be under 5MB" };
    }

    return { valid: true, message: "" };
}

/**
 * Run a full registration form validation.
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateRegistrationForm({ name, email, password, confirmPassword }) {
    const errors = {};

    const nameResult = validateName(name);
    if (!nameResult.valid) errors.name = nameResult.message;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) errors.email = emailResult.message;

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) errors.password = passwordResult.message;

    const matchResult = validatePasswordMatch(password, confirmPassword);
    if (!matchResult.valid) errors.confirmPassword = matchResult.message;

    return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Run a login form validation.
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateLoginForm({ email, password }) {
    const errors = {};

    const emailResult = validateEmail(email);
    if (!emailResult.valid) errors.email = emailResult.message;

    if (!password) errors.password = "Password is required";

    return { valid: Object.keys(errors).length === 0, errors };
}
