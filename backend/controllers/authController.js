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

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password",
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

        if (!user || !(await user.comparePassword(currentPassword))) {
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