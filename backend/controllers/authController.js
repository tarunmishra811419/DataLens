import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

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

// Log in an existing user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email }).select("+password");

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