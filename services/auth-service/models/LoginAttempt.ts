import mongoose, { Schema, Document } from "mongoose";

export interface ILoginAttempt extends Document {
  username?: string;
  userId?: string;
  ip: string;
  geo?: any;
  device?: any;
  status: "success" | "failed" | "locked" | "unverified";
  message: string;
  timestamp: Date;
}

const loginAttemptSchema = new Schema<ILoginAttempt>({
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

export default mongoose.model<ILoginAttempt>(
  "LoginAttempt",
  loginAttemptSchema
);
