import express from "express";
import {
    registerUser,
    sendRegisterOtp,
    registerWithOtp,
    loginUser,
    googleAuth,
    getMe,
    updateProfile,
    updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", sendRegisterOtp);
router.post("/register-with-otp", registerWithOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);          // Firebase Google sign-in
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

export default router;