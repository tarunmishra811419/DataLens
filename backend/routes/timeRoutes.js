import express from "express";
import {
    getSessions,
    logSession,
    clearDateSession,
    clearAllSessions,
} from "../controllers/timeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getSessions).delete(clearAllSessions);
router.post("/log", logSession);
router.delete("/:date", clearDateSession);

export default router;
