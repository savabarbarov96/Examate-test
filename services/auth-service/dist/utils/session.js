import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
const redisConfig = {
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    family: 4, // Force IPv4
};
export const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", redisConfig);
redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});
redis.on("connect", () => {
    console.log("Redis connected successfully");
});
export async function createSession(userId) {
    const sessionId = uuidv4();
    const key = `session:${sessionId}`;
    await redis.set(key, userId, "EX", 8 * 60 * 60);
    await redis.publish("sessions", JSON.stringify({ sessionId, action: "login" }));
    return { sessionId, userId };
}
export async function terminateSession(sessionId) {
    const key = `session:${sessionId}`;
    const userId = await redis.get(key);
    if (userId) {
        await redis.del(key);
        await redis.publish("sessions", JSON.stringify({ sessionId, action: "logout" }));
    }
}
export async function countActiveSessions() {
    const keys = await redis.keys("session:*");
    return keys.length;
}
// real-time session updates via Socket.IO
export function watchSessions(io) {
    const subscriber = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", redisConfig);
    subscriber.on("connect", () => {
        console.log("Redis subscriber connected successfully");
    });
    subscriber.subscribe("sessions", (err, count) => {
        if (err)
            console.error("Failed to subscribe to Redis sessions channel:", err);
        else
            console.log("Subscribed to Redis sessions channel");
    });
    subscriber.on("message", async (_, message) => {
        const activeCount = await countActiveSessions();
        io.emit("activeSessionsUpdate", { activeSessions: activeCount });
    });
}
