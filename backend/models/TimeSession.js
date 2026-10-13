import mongoose from "mongoose";

const timeSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        date: {
            type: String, // ISO date string in YYYY-MM-DD format
            required: true,
            index: true,
        },
        seconds: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Compound index for fast upserts and lookups
timeSessionSchema.index({ user: 1, date: 1 }, { unique: true });

const TimeSession = mongoose.model("TimeSession", timeSessionSchema);

export default TimeSession;
