import { countActiveSessions } from "../utils/session.js";
import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.log("Not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const activeSessions = await countActiveSessions();
    res.status(200).json({ activeSessions });
  } catch (err) {
    console.error("Failed to count active sessions:", err);
    res.status(500).json({ activeSessions: 0 });
  }
};