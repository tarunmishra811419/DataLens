import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: String,
            required: [true, "OTP is required"],
        },
        purpose: {
            type: String,
            enum: ["register", "login"],
            default: "register",
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Automatically deleted by MongoDB when expiresAt is reached
        },
    },
    { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
