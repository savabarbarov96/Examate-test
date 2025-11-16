import winston from "winston";
import LoginAttempt from "../models/LoginAttempt.js";
const { combine, timestamp, colorize, align, printf } = winston.format;
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(colorize({ all: true }), timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }), align(), printf((info) => `[${info.timestamp}] [${info.correlationId || "no-correlation-id"}] ${info.level}: ${info.message}`)),
    transports: [new winston.transports.Console()],
});
export async function recordLoginAttempt({ username, userId, ip, geo, device, status, message, }) {
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
    }
    catch (err) {
        logger.error(`Failed to log login attempt: ${err.message}`);
    }
}
export default logger;
