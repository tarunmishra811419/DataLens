import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";

// Send OTP to email for account registration
export const sendRegisterOtp = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if an account already exists with this email
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists. Please log in.",
            });
        }

        // Throttle requests: check if an OTP was sent within the last 45 seconds
        const recentOtp = await Otp.findOne({
            email: normalizedEmail,
            purpose: "register",
            createdAt: { $gt: new Date(Date.now() - 45 * 1000) },
        });

        if (recentOtp) {
            return res.status(429).json({
                message: "A verification code was recently sent. Please wait before requesting another.",
            });
        }

        // Generate 6-digit numeric OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert OTP record for this email
        await Otp.findOneAndUpdate(
            { email: normalizedEmail, purpose: "register" },
            { otp: otpCode, expiresAt, purpose: "register", createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send OTP email
        const emailResult = await sendOtpEmail(normalizedEmail, otpCode, name || "");

        res.status(200).json({
            success: true,
            message: `Verification code sent to ${normalizedEmail}`,
            simulated: emailResult.simulated,
            devOtp: emailResult.simulated ? emailResult.devOtp : undefined,
        });
    } catch (error) {
        console.error("sendRegisterOtp error:", error);
        res.status(500).json({ message: error.message || "Failed to send verification code" });
    }
};

// Verify OTP and create user account
export const registerWithOtp = async (req, res) => {
    try {
        const { name, email, password, otp, role } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({
                message: "Name, email, password, and 6-digit verification code are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const cleanedOtp = String(otp).trim();

        // Check if user already registered in the meantime
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists. Please log in.",
            });
        }

        // Validate OTP
        const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "register" });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Verification code expired or not found. Please request a new code.",
            });
        }

        if (otpRecord.otp !== cleanedOtp) {
            return res.status(400).json({
                message: "Invalid verification code. Please check your email and try again.",
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                message: "Verification code has expired. Please request a new code.",
            });
        }

        // OTP is valid - remove it so it cannot be reused
        await Otp.deleteOne({ _id: otpRecord._id });

        // Create the user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: role || "Data Analyst",
            authProvider: "local",
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio || "",
            location: user.location || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            authProvider: user.authProvider,
            token: generateToken(user._id),
            message: "Account verified and created successfully!",
        });
    } catch (error) {
        console.error("registerWithOtp error:", error);
        res.status(500).json({ message: error.message || "Failed to create account" });
    }
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "Data Analyst",
            authProvider: "local",
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio || "",
            location: user.location || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            authProvider: user.authProvider,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Log in an existing user - Step 1: Validate credentials, send OTP
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // If account was created with Google, block email/password login
        if (user.authProvider === "google" && !user.password) {
            return res.status(401).json({
                message: "This account uses Google sign-in. Please sign in with Google.",
            });
        }

        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Credentials valid → send OTP for 2-step verification
        // Throttle: check if an OTP was sent within the last 30 seconds
        const recentOtp = await Otp.findOne({
            email: normalizedEmail,
            purpose: "login",
            createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
        });

        if (recentOtp) {
            // OTP was already sent recently, just tell client to proceed to OTP step
            return res.json({
                pendingOtp: true,
                email: normalizedEmail,
                message: "Verification code already sent. Please check your email.",
            });
        }

        // Generate 6-digit numeric OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert login OTP record
        await Otp.findOneAndUpdate(
            { email: normalizedEmail, purpose: "login" },
            { otp: otpCode, expiresAt, purpose: "login", createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send OTP email
        const emailResult = await sendOtpEmail(normalizedEmail, otpCode, user.name || "");

        res.json({
            pendingOtp: true,
            email: normalizedEmail,
            message: `Verification code sent to ${normalizedEmail}`,
            simulated: emailResult.simulated,
            devOtp: emailResult.simulated ? emailResult.devOtp : undefined,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Log in an existing user - Step 2: Verify OTP and issue token
export const loginVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and verification code are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const cleanedOtp = String(otp).trim();

        // Find the user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }

        // Validate login OTP
        const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "login" });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Verification code expired or not found. Please log in again.",
            });
        }

        if (otpRecord.otp !== cleanedOtp) {
            return res.status(400).json({
                message: "Invalid verification code. Please check your email and try again.",
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                message: "Verification code has expired. Please log in again.",
            });
        }

        // OTP is valid - remove it so it cannot be reused
        await Otp.deleteOne({ _id: otpRecord._id });

        // Issue token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio || "",
            location: user.location || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            authProvider: user.authProvider,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Resend login OTP
export const resendLoginOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Verify user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }

        // Throttle: 30 seconds cooldown
        const recentOtp = await Otp.findOne({
            email: normalizedEmail,
            purpose: "login",
            createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
        });

        if (recentOtp) {
            return res.status(429).json({
                message: "A verification code was recently sent. Please wait before requesting another.",
            });
        }

        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { email: normalizedEmail, purpose: "login" },
            { otp: otpCode, expiresAt, purpose: "login", createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const emailResult = await sendOtpEmail(normalizedEmail, otpCode, user.name || "");

        res.json({
            success: true,
            message: `New verification code sent to ${normalizedEmail}`,
            simulated: emailResult.simulated,
            devOtp: emailResult.simulated ? emailResult.devOtp : undefined,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to resend verification code" });
    }
};

/**
 * Google OAuth - called from frontend with Firebase user info.
 * Finds existing user by email or creates a new one.
 * Returns our own JWT so the rest of the app works identically.
 */
export const googleAuth = async (req, res) => {
    try {
        const { name, email, googleId, avatar } = req.body;

        if (!email || !name) {
            return res.status(400).json({ message: "Google sign-in data incomplete" });
        }

        // Find existing user
        let user = await User.findOne({ email });

        if (user) {
            // Update Google info if they previously had a local account
            if (!user.googleId) {
                user.googleId = googleId || "";
                user.authProvider = "google";
                if (avatar && !user.avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            // Create new Google user (no password)
            user = await User.create({
                name,
                email,
                googleId: googleId || "",
                avatar: avatar || "",
                authProvider: "google",
                role: "Data Analyst",
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio || "",
            location: user.location || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            authProvider: user.authProvider,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get the currently logged-in user's info
export const getMe = async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        bio: req.user.bio || "",
        location: req.user.location || "",
        phone: req.user.phone || "",
        avatar: req.user.avatar || "",
        authProvider: req.user.authProvider || "local",
        createdAt: req.user.createdAt,
    });
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, role, bio, location, phone, avatar } = req.body;

        if (name !== undefined) user.name = name.trim();
        if (role !== undefined) user.role = role.trim();
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (phone !== undefined) user.phone = phone;
        if (avatar !== undefined) user.avatar = avatar;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            bio: updatedUser.bio,
            location: updatedUser.location,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            authProvider: updatedUser.authProvider,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long",
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                message: "Google accounts do not have a password to update",
            });
        }

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request password reset email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide an email address" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email. Please check the spelling or create an account first.",
            });
        }

        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please sign in with Google.",
            });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { email: normalizedEmail, purpose: "reset" },
            { otp: resetCode, expiresAt, purpose: "reset", createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendPasswordResetEmail(normalizedEmail, resetCode, user.name || "");

        res.json({
            success: true,
            message: "Password reset instructions sent to your email.",
        });
    } catch (error) {
        console.error("forgotPassword error:", error);
        res.status(500).json({ message: error.message || "Failed to send reset email" });
    }
};