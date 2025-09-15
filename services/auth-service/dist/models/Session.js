import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ["active", "terminated", "expired"],
        default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
});
sessionSchema.index({ status: 1 });
export const Session = mongoose.model("Session", sessionSchema);
