import TimeSession from "../models/TimeSession.js";

// Get all time sessions for the logged-in user
export const getSessions = async (req, res) => {
    try {
        const sessions = await TimeSession.find({ user: req.user._id }).sort({
            date: -1,
        });

        // Format as both an object map (date -> seconds) and full session list
        const sessionsMap = {};
        sessions.forEach((s) => {
            sessionsMap[s.date] = s.seconds;
        });

        res.json({
            sessionsMap,
            sessions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Log or increment time for a given day
export const logSession = async (req, res) => {
    try {
        const { seconds, date, notes } = req.body;

        if (seconds === undefined || isNaN(seconds)) {
            return res.status(400).json({ message: "Valid seconds is required" });
        }

        const sessionDate =
            date || new Date().toISOString().split("T")[0];

        // Increment seconds if already exists, or create new
        const updated = await TimeSession.findOneAndUpdate(
            { user: req.user._id, date: sessionDate },
            {
                $inc: { seconds: Math.round(Number(seconds)) },
                ...(notes ? { $set: { notes } } : {}),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear time record for a specific day
export const clearDateSession = async (req, res) => {
    try {
        const date = req.params.date;
        if (!date) {
            return res.status(400).json({ message: "Date parameter is required" });
        }

        await TimeSession.findOneAndDelete({
            user: req.user._id,
            date,
        });

        res.json({ message: `Session cleared for ${date}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear all time sessions for logged-in user
export const clearAllSessions = async (req, res) => {
    try {
        await TimeSession.deleteMany({ user: req.user._id });
        res.json({ message: "All time tracking sessions cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
