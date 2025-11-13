import LoginAttempt from "../models/LoginAttempt.js";

export async function recordLoginAttempt({
  username,
  userId,
  ip,
  geo,
  device,
  status,
  message,
}: {
  username?: string;
  userId?: string;
  ip: string;
  geo?: any;
  device?: any;
  status: "success" | "failed" | "locked" | "unverified";
  message: string;
}) {
  try {
    await LoginAttempt.create({
      username,
      userId,
      ip,
      geo,
      device,
      status,
      message,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to log login attempt:", err);
  }
}
