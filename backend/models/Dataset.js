import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Dataset name is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "Finance",
                "Education",
                "Fitness",
                "Career",
                "Business",
                "Custom",
            ],
            default: "Custom",
        },
        source: {
            type: String,
            enum: ["manual", "upload"],
            default: "manual",
        },
        columns: {
            type: [String],
            required: true,
        },
        rows: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        timePeriod: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Dataset = mongoose.model("Dataset", datasetSchema);

export default Dataset;