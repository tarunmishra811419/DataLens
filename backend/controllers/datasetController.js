import Dataset from "../models/Dataset.js";

// Get all datasets belonging to the logged-in user
export const getDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find({ user: req.user._id }).sort({
            updatedAt: -1,
        });

        res.json(datasets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single dataset by its ID
export const getDatasetById = async (req, res) => {
    try {
        const dataset = await Dataset.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        res.json(dataset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new dataset
export const createDataset = async (req, res) => {
    try {
        const { name, category, source, columns, rows, timePeriod } =
            req.body;

        if (!name || !columns || columns.length === 0) {
            return res.status(400).json({
                message: "Dataset name and columns are required",
            });
        }

        const dataset = await Dataset.create({
            user: req.user._id,
            name,
            category,
            source,
            columns,
            rows,
            timePeriod,
        });

        res.status(201).json(dataset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing dataset
export const updateDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        const { name, category, columns, rows, timePeriod } = req.body;

        if (name !== undefined) dataset.name = name;
        if (category !== undefined) dataset.category = category;
        if (columns !== undefined) dataset.columns = columns;
        if (rows !== undefined) dataset.rows = rows;
        if (timePeriod !== undefined) dataset.timePeriod = timePeriod;

        const updated = await dataset.save();

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a dataset
export const deleteDataset = async (req, res) => {
    try {
        const dataset = await Dataset.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        res.json({ message: "Dataset deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};