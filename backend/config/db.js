import mongoose from "mongoose";
import dns from "dns";

// Ensure Atlas SRV resolution succeeds even if local ISP DNS fails to resolve SRV records
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // ignore if not supported
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;