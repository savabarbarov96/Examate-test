import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis(process.env.REDIS_URL || "redis://default:NtrpfnDC6bQUJCQxlK2sj0vFVMCMZiDxu09xSouhsAOktGZ2BbW4YFNbrjuAJnMx@s0owg0cwso080gg80ckgcow4:6379/0");

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export async function createSession(userId: string) {
  const sessionId = uuidv4();
  const key = `session:${sessionId}`;

  await redis.set(key, userId, "EX", 8 * 60 * 60);

  await redis.publish("sessions", JSON.stringify({ sessionId, action: "login" }));

  return { sessionId, userId };
}

export async function terminateSession(sessionId: string) {
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
  const subscriber = new Redis(process.env.REDIS_URL || "redis://default:NtrpfnDC6bQUJCQxlK2sj0vFVMCMZiDxu09xSouhsAOktGZ2BbW4YFNbrjuAJnMx@s0owg0cwso080gg80ckgcow4:6379/0");

  subscriber.subscribe("sessions", (err, count) => {
    if (err) console.error("Failed to subscribe to Redis sessions channel:", err);
  });

  subscriber.on("message", async (_, message) => {
    const activeCount = await countActiveSessions();
    io.emit("activeSessionsUpdate", { activeSessions: activeCount });
  });
}
