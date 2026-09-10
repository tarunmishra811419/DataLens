import express from "express";
import {
    getDatasets,
    getDatasetById,
    createDataset,
    updateDataset,
    deleteDataset,
} from "../controllers/datasetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getDatasets).post(createDataset);

router
    .route("/:id")
    .get(getDatasetById)
    .put(updateDataset)
    .delete(deleteDataset);

export default router;