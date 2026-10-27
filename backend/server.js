import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import timeRoutes from "./routes/timeRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();

const rawClientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : "";
const clientUrlNoSlash = rawClientUrl.replace(/\/+$/, "");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    "https://data-lens-ten.vercel.app",
    clientUrlNoSlash,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, server-to-server, health checks)
            if (!origin) return callback(null, true);

            const normalized = origin.replace(/\/+$/, "");
            const allowed =
                allowedOrigins.includes(normalized) ||
                normalized.endsWith(".vercel.app");

            if (allowed) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "DataLens API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/time-sessions", timeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});