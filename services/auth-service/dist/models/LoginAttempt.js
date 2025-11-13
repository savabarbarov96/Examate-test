import mongoose, { Schema } from "mongoose";
const loginAttemptSchema = new Schema({
    username: { type: String },
    userId: { type: String },
    ip: { type: String, required: true },
    geo: { type: Object },
    device: { type: Object },
    status: {
        type: String,
        enum: ["success", "failed", "locked", "unverified"],
        required: true,
    },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
});
export default mongoose.model("LoginAttempt", loginAttemptSchema);
